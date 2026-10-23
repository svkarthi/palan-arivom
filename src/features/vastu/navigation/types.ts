import type { RoomId } from '../data/rooms';

export type VastuStackParamList = {
  VastuTabs: undefined;
  RoomDetail: { roomId: RoomId };
};

export type VastuTabParamList = {
  Compass: undefined;
  Guide: undefined;
  Plan: undefined;
  Report: undefined;
};
