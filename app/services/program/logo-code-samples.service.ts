import { injectable } from "app/di";
import { RandomHelper } from "app/utils/random-helper";

const codeSamples = [
  `
repeat 14 [
    fd repcount * 8 
    rt 90
]`,
  `
repeat 10 [
    repeat 8 [
        fd 20 
        rt 360 / 8
    ] 
    rt 360 / 10
]`,
  `
penup 
setxy -40 -20 
pendown 
repeat 8 [
    fd 40 
    rt 360 / 8
]`,
  `
repeat 10 [
    fd 5 * repcount 
    repeat 3 [
        fd 18 
        rt 360 /3 
    ] 
    rt 360 / 10
]`,
  `
  repeat 10 [
    fd 10
    rt 90
    fd 10
    lt 90
  ]`,
  `
  penup
  setxy -80 0
  repeat 10 [
    arc 360 20
    fd 40
    rt 36
  ]
    `,
  `
  rt 18
  repeat 5 [
      fd 100
        rt 144
  ]`,
  `
  forward 50
  right 90
  forward 100
  arc 360 50`
];

@injectable()
export class LogoCodeSamplesService {
  public getRandomSample() {
    return codeSamples[RandomHelper.getRandomInt(0, codeSamples.length - 1)];
  }
}
