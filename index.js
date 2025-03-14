import { createLibp2p } from 'libp2p'
import { createHelia } from 'helia'
import { createOrbitDB, IPFSBlockStorage } from '@orbitdb/core'
import { Libp2pOptions } from './libp2p.js'
import { FsBlockstore } from 'blockstore-fs'
import bootstrapConfig from './bootstrap.json' with { type: "json" }
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const main = async () => {
  // create a random directory to avoid OrbitDB conflicts.
  const blockstore = new FsBlockstore('./data/ipfs');
    
  const libp2p = await createLibp2p(Libp2pOptions)
  const ipfs = await createHelia({ libp2p, blockstore })
  const entryStorage = await IPFSBlockStorage({ ipfs, pin: true });

  const orbitdb = await createOrbitDB({ ipfs, directory: "./data" });

  let updatesDB = await orbitdb.open(
      bootstrapConfig.databases.updates,
      {entryStorage}
  );
  let serviceAdsDB = await orbitdb.open(
      bootstrapConfig.databases.serviceAds,
      {entryStorage}
  );
  let buyOffersDB = await orbitdb.open(
      bootstrapConfig.databases.buyOffers,
      {entryStorage}
  );
  let agreementsDB = await orbitdb.open(
      bootstrapConfig.databases.agreements,
      {entryStorage}
  );

  // clean up when stopping this app using ctrl+c
  process.on('SIGINT', async () => {
      // close databases
      await updatesDB.close()
      await serviceAdsDB.close()
      await buyOffersDB.close()
      await agreementsDB.close()

      // stop orbitdb and ipfs
      await orbitdb.stop()
      await ipfs.stop()

      process.exit()
  })

  // create MCP Server
  const server = new McpServer({
    name: "PayAI MCP Server",
    version: "1.0.0",
  });

  // add a resource to list all Solana related MCP Servers
  server.tool(
    "explore-marketplace",
    async () => {
      const serviceListings = await serviceAdsDB.all();

      const content = [{
        type: "text",
        text: JSON.stringify(serviceListings)
      }]

      return {content};
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main()
