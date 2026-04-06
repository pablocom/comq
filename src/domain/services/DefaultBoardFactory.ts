import { BoardNode } from '../entities/BoardNode';
import { CommunicationBoard } from '../entities/CommunicationBoard';

export class DefaultBoardFactory {
  static create(): CommunicationBoard {
    return CommunicationBoard.create('default', 'Tablero predeterminado', [
      BoardNode.create('basic-needs', 'Necesidades Básicas', 0, [
        BoardNode.create('food', 'Alimentación', 0, [
          BoardNode.create('hungry', 'Tengo hambre', 0),
          BoardNode.create('thirsty', 'Tengo sed', 1),
          BoardNode.create('specific-food', 'Quiero comer algo rico', 2),
        ]),
        BoardNode.create('comfort', 'Comodidad', 1, [
          BoardNode.create('bathroom', 'Necesito ir al baño', 0),
          BoardNode.create('cold', 'Tengo frío', 1),
          BoardNode.create('hot', 'Tengo calor', 2),
          BoardNode.create('position', 'Quiero cambiar de posición', 3),
        ]),
        BoardNode.create('rest', 'Descanso', 2, [
          BoardNode.create('sleep', 'Quiero dormir', 0),
          BoardNode.create('relax', 'Quiero descansar un rato', 1),
        ]),
      ]),
      BoardNode.create('feelings', 'Cómo me siento', 1, [
        BoardNode.create('happy', 'Estoy bien', 0),
        BoardNode.create('love', 'Los quiero mucho', 1),
        BoardNode.create('grateful', 'Gracias por estar aquí', 2),
        BoardNode.create('better', 'Me siento mejor hoy', 3),
        BoardNode.create('calm', 'Estoy tranquilo', 4),
        BoardNode.create('need-company', 'Quiero compañía', 5),
      ]),
      BoardNode.create('activities', 'Quiero hacer', 2, [
        BoardNode.create('music', 'Escuchar música', 0),
        BoardNode.create('tv', 'Ver la televisión', 1),
        BoardNode.create('outside', 'Ir afuera', 2),
        BoardNode.create('talk', 'Hablar con alguien', 3),
        BoardNode.create('walk', 'Dar un paseo', 4),
      ]),
      BoardNode.create('communication', 'Comunicación', 3, [
        BoardNode.create('yes', 'Sí', 0),
        BoardNode.create('no', 'No', 1),
        BoardNode.create('thanks', 'Gracias', 2),
        BoardNode.create('please', 'Por favor', 3),
        BoardNode.create('repeat', 'Repite por favor', 4),
        BoardNode.create('understand', 'Te entiendo', 5),
      ]),
    ]);
  }
}
