import WebSocket from 'isomorphic-ws';
import { Subscriber } from './message';

type SubscriberIdentifier = string;
type PublisherIdentifier = string;

export interface TmpSubscriberShelterSubscriber
  extends Omit<Subscriber, 'type' | 'ip'> {
  client: WebSocket;
}

export type TmpSubscriberShelterSubscribers = Map<
  SubscriberIdentifier,
  TmpSubscriberShelterSubscriber
>;

export type TmpSubscriberShelter = Map<
  PublisherIdentifier,
  {
    subscribers: TmpSubscriberShelterSubscribers;
    timestamp: number;
  }
>;
