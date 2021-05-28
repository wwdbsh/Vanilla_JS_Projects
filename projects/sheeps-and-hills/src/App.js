import Hill from "./components/Hill.js";
import SheepController from "./components/SheepController.js";
import Sun from "./components/Sun.js";

export default class App{
    constructor($target){
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        $target.appendChild(this.canvas);

        this.sun = new Sun();

        this.hills = [
            new Hill("#fd6bea", 0.2, 12),
            new Hill("#ff59c2", 0.5, 8),
            new Hill("#ff4673", 1.4, 6),
        ];

        this.sheepController = new SheepController();

        window.addEventListener("resize", this.resize.bind(this), false);
        this.resize();

        requestAnimationFrame(this.animate.bind(this));
    }

    resize(){
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;

        this.canvas.width = this.stageWidth*2;
        this.canvas.height = this.stageHeight*2;
        this.ctx.scale(2, 2);

        this.sun.resize(this.stageWidth, this.stageHeight);

        for(let i = 0; i < this.hills.length; i++){
            this.hills[i].resize(this.stageWidth, this.stageHeight);
        }

        this.sheepController.resize(this.stageWidth, this.stageHeight);
    }

    animate(t){
        requestAnimationFrame(this.animate.bind(this));
        
        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
        
        this.sun.draw(this.ctx, t);
        
        let dots;
        for(let i = 0; i < this.hills.length; i++){
            dots = this.hills[i].draw(this.ctx);
        }

        this.sheepController.draw(this.ctx, t, dots);
    }
}