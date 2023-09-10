import BaseRoomConfig from '../../room.config';

export default interface RoomConfig
  extends Omit<BaseRoomConfig, 'width' | 'height'> {
  size: number;
}
