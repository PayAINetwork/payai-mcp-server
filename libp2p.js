import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { identify, identifyPush } from '@libp2p/identify'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from "@libp2p/bootstrap";
import { LevelDatastore } from 'datastore-level'
import bootstrapConfig from './bootstrap.json' with { type: "json" }

const datastore = new LevelDatastore('./data/libp2p')

export const Libp2pOptions = {
  datastore,
  peerStore: {
    persistence: true,
    threshold: 5
  },
  peerDiscovery: [
      bootstrap({
        list: bootstrapConfig.addresses
      }),
  ],
  addresses: {
    listen: [
      '/ip4/0.0.0.0/tcp/0',
      '/ip4/0.0.0.0/tcp/0/ws'
    ]
  },
  transports: [
    tcp(),
    webSockets()
  ],
  connectionEncrypters: [noise()],
  streamMuxers: [yamux()],
  services: {
    identify: identify(),
    identifyPush: identifyPush(),
    pubsub: gossipsub({ allowPublishToZeroTopicPeers: true }),
  }
}
