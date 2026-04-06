import { BoardNode } from '../entities/BoardNode';
import { CommunicationBoard } from '../entities/CommunicationBoard';

export class DefaultBoardFactory {
  static create(): CommunicationBoard {
    const board = CommunicationBoard.create('default', 'Tablero predeterminado', [
      BoardNode.create('basic-needs', 'Necesidades Básicas', 0, [
        BoardNode.create('food', 'Alimentación', 0, [
          BoardNode.create('hungry', 'Tengo hambre', 0),
          BoardNode.create('thirsty', 'Tengo sed', 1),
          BoardNode.create('specific-food', 'Quiero comer algo específico', 2),
        ]),
        BoardNode.create('hygiene', 'Higiene', 1, [
          BoardNode.create('bathroom', 'Necesito ir al baño', 0),
          BoardNode.create('shower', 'Quiero bañarme', 1),
          BoardNode.create('teeth', 'Quiero lavarme los dientes', 2),
        ]),
        BoardNode.create('rest', 'Descanso', 2, [
          BoardNode.create('sleep', 'Quiero dormir', 0),
          BoardNode.create('tired', 'Estoy cansado', 1),
          BoardNode.create('uncomfortable', 'Estoy incómodo', 2),
        ]),
      ]),
      BoardNode.create('emotions', 'Emociones', 1, [
        BoardNode.create('sad', 'Estoy triste', 0),
        BoardNode.create('happy', 'Estoy feliz', 1),
        BoardNode.create('afraid', 'Tengo miedo', 2),
        BoardNode.create('lonely', 'Me siento solo', 3),
        BoardNode.create('angry', 'Estoy enojado', 4),
        BoardNode.create('anxious', 'Estoy ansioso', 5),
      ]),
      BoardNode.create('pain', 'Dolor', 2, [
        BoardNode.create('headache', 'Me duele la cabeza', 0),
        BoardNode.create('body-pain', 'Me duele el cuerpo', 1),
        BoardNode.create('stomach', 'Me duele el estómago', 2),
        BoardNode.create('chest', 'Me duele el pecho', 3),
        BoardNode.create('general-pain', 'Me duele mucho', 4),
      ]),
      BoardNode.create('communication', 'Comunicación', 3, [
        BoardNode.create('talk', 'Quiero hablar con alguien', 0),
        BoardNode.create('not-understand', 'No entiendo', 1),
        BoardNode.create('repeat', 'Repite por favor', 2),
        BoardNode.create('yes', 'Sí', 3),
        BoardNode.create('no', 'No', 4),
        BoardNode.create('thanks', 'Gracias', 5),
      ]),
    ]);

    return board;
  }
}
