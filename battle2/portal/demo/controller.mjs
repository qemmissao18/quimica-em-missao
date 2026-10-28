import {isEliminated} from 'portal/demo/game-rules.mjs';
// Local review controller only. Never imported by the production game.
export class DemoRound{
 constructor(questions,clock=()=>performance.now()){this.questions=questions;this.clock=clock;this.index=-1;this.hints=3;this.score=0;this.answers=[];}
 start(){if(this.eliminated||this.index>=this.questions.length-1)return null;this.index++;this.started=this.clock();this.deadline=this.started+60000;this.locked=false;this.usedHint=false;return this.questions[this.index];}
 get eliminated(){return isEliminated(this.answers);}
 remaining(){return Math.max(0,this.deadline-this.clock());}
 answer(choice){if(this.eliminated||this.locked||!Number.isInteger(choice)||choice<0||choice>4||this.remaining()<=0)return null;this.locked=true;const correct=choice===this.questions[this.index].correct_index;const points=correct?500+Math.floor(500*this.remaining()/60000):0;this.score+=points;const result={correct,points};this.answers.push(result);return result;}
 hint(){if(this.locked||this.usedHint||!this.hints||this.remaining()<=0)return false;this.usedHint=true;this.hints--;return true;}
 expire(){if(this.locked||this.remaining()>0)return false;this.locked=true;this.answers.push({correct:false,points:0,reason:"timeout"});return true;}
}
