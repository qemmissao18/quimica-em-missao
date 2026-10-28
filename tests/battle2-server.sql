-- Integration assertions. Test rows and users are rolled back; no production configuration changes.
begin;
create temporary table battle2_checks(label text);
do $$
declare h uuid:=gen_random_uuid(); p1 uuid:=gen_random_uuid(); p2 uuid:=gen_random_uuid();
 r jsonb; s jsonb; grant1 jsonb; grant2 jsonb; rid uuid; mid uuid; oldmid uuid;
 i integer; correct_choice integer; rejected boolean;
begin
 insert into auth.users(id) values(h),(p1),(p2);
 perform set_config('request.jwt.claim.sub',h::text,true);
 r:=public.chem_battle2_room('create',jsonb_build_object('nickname','QA observador','role','host_observer'));rid:=(r->>'room_id')::uuid;
 perform set_config('request.jwt.claim.sub',p1::text,true);
 perform public.chem_battle2_room('join',jsonb_build_object('nickname','QA 1','code',r->>'code'));
 perform set_config('request.jwt.claim.sub',h::text,true);
 rejected:=false;begin perform public.chem_battle2('start',jsonb_build_object('room_id',rid));exception when others then rejected:=true;end;
 if not rejected then raise exception 'Observador contado como jogador';end if;
 perform set_config('request.jwt.claim.sub',p2::text,true);
 perform public.chem_battle2_room('join',jsonb_build_object('nickname','QA 2','code',r->>'code'));
 perform set_config('request.jwt.claim.sub',h::text,true);
 s:=public.chem_battle2('start',jsonb_build_object('room_id',rid));mid:=(s->>'match_id')::uuid;
 if not (s->>'spectator')::boolean or (s->>'can_answer')::boolean then raise exception 'Papel do observador incorreto';end if;
 insert into battle2_checks values('Observador não conta para o mínimo de dois nem responde');
 for i in 0..14 loop
  update battle2_private.matches_v2 set starts_at=statement_timestamp()-interval '1 second',deadline=statement_timestamp()+interval '59 seconds' where id=mid;
  select (question->>'correct_index')::int into correct_choice from battle2_private.rounds_v2 where match_id=mid and position=i;
  if i=0 then
   perform set_config('request.jwt.claim.sub',h::text,true);
   rejected:=false;begin perform public.chem_battle2('answer',jsonb_build_object('room_id',rid,'match_id',mid,'position',i,'choice',0));exception when others then rejected:=true;end;
   if not rejected then raise exception 'Observador respondeu';end if;
   rejected:=false;begin perform public.chem_battle2('hint',jsonb_build_object('room_id',rid,'match_id',mid,'position',i,'claim',true));exception when others then rejected:=true;end;
   if not rejected then raise exception 'Observador usou dica';end if;
  end if;
  if i<11 then
   perform set_config('request.jwt.claim.sub',p1::text,true);
   s:=public.chem_battle2('answer',jsonb_build_object('room_id',rid,'match_id',mid,'position',i,'choice',(correct_choice+1)%5));
   if i=10 and not (s->>'eliminated')::boolean then raise exception 'Não eliminou no erro 11';end if;
  end if;
  perform set_config('request.jwt.claim.sub',p2::text,true);
  if i=0 then
   grant1:=public.chem_battle2('hint',jsonb_build_object('room_id',rid,'match_id',mid,'position',i,'claim',true));
   grant2:=public.chem_battle2('hint',jsonb_build_object('room_id',rid,'match_id',mid,'position',i,'claim',true));
   if grant1->>'remaining'<>'2' or grant1<>grant2 then raise exception 'Dica repetida consumiu saldo';end if;
  end if;
  s:=public.chem_battle2('answer',jsonb_build_object('room_id',rid,'match_id',mid,'position',i,'choice',correct_choice));
  if not (s->'answer'->>'correct')::boolean then raise exception 'Correção incorreta';end if;
  if i=0 then
   s:=public.chem_battle2('answer',jsonb_build_object('room_id',rid,'match_id',mid,'position',i,'choice',(correct_choice+1)%5));
   if not (s->'answer'->>'correct')::boolean then raise exception 'Resposta duplicada mudou resultado';end if;
   rejected:=false;begin perform public.chem_battle2('advance',jsonb_build_object('room_id',rid,'match_id',mid,'manual',true,'expected_revision',(s->>'revision')::int));exception when others then rejected:=true;end;
   if not rejected then raise exception 'Participante avançou manualmente';end if;
  end if;
  perform set_config('request.jwt.claim.sub',h::text,true);
  s:=public.chem_battle2('advance',jsonb_build_object('room_id',rid,'match_id',mid,'manual',true,'expected_revision',(s->>'revision')::int));
 end loop;
 if not (s->>'settled')::boolean or jsonb_array_length(s->'ranking')<>2 then raise exception 'Ranking inválido';end if;
 if exists(select 1 from jsonb_array_elements(s->'ranking') x where x->>'id'=h::text) then raise exception 'Observador no ranking';end if;
 insert into battle2_checks values('15 rodadas, dicas idempotentes, respostas protegidas, eliminação em 11 erros e ranking sem observador');
 oldmid:=mid;s:=public.chem_battle2('replay',jsonb_build_object('room_id',rid,'match_id',mid));
 if s->>'match_id'=oldmid::text or s->>'position'<>'0' then raise exception 'Reinício falhou';end if;
 insert into battle2_checks values('Nova partida pelo anfitrião cria novo sorteio');
 perform set_config('request.jwt.claim.sub',p1::text,true);
 r:=public.chem_battle2_room('create',jsonb_build_object('nickname','QA anfitrião jogador','role','host_player'));rid:=(r->>'room_id')::uuid;
 perform set_config('request.jwt.claim.sub',p2::text,true);perform public.chem_battle2_room('join',jsonb_build_object('nickname','QA participante','code',r->>'code'));
 perform set_config('request.jwt.claim.sub',p1::text,true);s:=public.chem_battle2('start',jsonb_build_object('room_id',rid));
 if (s->>'spectator')::boolean or s->>'active_count'<>'2' then raise exception 'Anfitrião jogador não competiu';end if;
 rejected:=false;begin perform public.chem_battle2_room('kick',jsonb_build_object('room_id',rid,'user_id',p2));exception when others then rejected:=true;end;
 if not rejected then raise exception 'Anfitrião jogador removeu rival durante partida';end if;
 insert into battle2_checks values('Anfitrião jogador compete e não remove rivais após início');
end $$;
select * from battle2_checks;
rollback;
