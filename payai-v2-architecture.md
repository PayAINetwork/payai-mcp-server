# PayAI MCP Server Plans

It starts with the PayAI community and the broader Crypto Twitter audience.

1. You see your favorite AI Agent, let's say it's @dolos_diary
 .

2. You want them to create something special for you.

3. You ask @payaibot to make @dolos_diary an offer for e.g. 0.5 SOL (more later).

4. @payaibot replies with a payment link. 

This link allows you or anyone else to pay the 0.5 SOL, and allows @dolos_diary
 to install the payai-sdk (code).

The payai-sdk allows the AI agent to deliver the work and get paid.

5. The payment is settled in $PAYAI 


## Current PAYAI Architecture
 - Libp2p/IFPS for contract negotiation
 - Solana for payment

### Problem is...
 - Libp2p/IPFS adds complexity and latency to negotiation and user experience
 - User experience is slow and cumbersome -- there is a 3 step process before the contract is even funded which is the fourth step, and only then can the agent start working.

## Future Architecture
 - Replace libp2p/IPFS with a traditional web server and database

The flow will look as it does above.
Let's explain the new flow with the new architecture:

1. User messages @payaibot on X saying "I want to pay 0.5 SOL to @dolos_diary to write me a birthday post on X."
    - This involves @payaibot using the twitter API to listen to messages on X
        - we already have this as an Eliza agent.

2. @payaibot replies with a payment link.
    - This involves @payaibot creating a new payment link and storing it in the database.
    - The database will look like this:
        - payment_link_id
        - payment_amount_in_sol
        - payment_amount_in_payai
        - seller_agent_x_author_id
        - seller_agent_x_name
        - seller_agent_x_username
        - buyer_x_author_id
        - buyer_x_name
        - buyer_x_username
        - buyer_message
        - created_at
        - buyer_x_status_id
        - payment_link_status
            - pending
            - funded
            - work started
            - work delivered
            - payment complete
        - proof_of_work_url
        
    - this involves creating a predetermined escrow account address that the buyer will send funds to
        - we would have to create a new Solana program to handle this
        - the backend will predefine an escrow account address that the buyer will send funds to
        - we create a solana program and then the program creates escrow accounts that are not on the elliptic curve
            - Program Derived Addresses (PDA)
                - simpler because we don't have to manage private keys -- only one private key for the program authority
                - can update authority periodically
                
        - The payment is settled in $PAYAI 


3. User pays 0.5 SOL to the payment link.
    - this involves creating a user interface that allows the user to send funds to the escrow account
        - frontend should be simple
            - Shows the buyer, the seller, the amount, and the message request
            - Has a button to send funds to the escrow account (support phantom wallet)
                - anybody can send funds to the escrow account
            - Has a button to cancel the payment
                - only the buyer can cancel the payment and recover their funds
            - Has a button to send a message to the seller

            - Has an info message to the seller directing them to the payai-sdk codebase to start working
                - payai-sdk documentation needs to be clear and easy to understand
                - payai-sdk needs to be easy to install and use


4. The buyer accepts the payment and the work is started.
    - this involves the buyer accepting the payment and then the work being started
                - ideally the agent developer does an install, easy config, and can add all the custom code they need themselves
                    - the payai-sdk should only provide the following functionality:
                        - notify the agent via a webhook or websocket when payment is received
                        - allow the agent to deliver their work to the buyer
                            - allow the agent to claim their funds
                                - initially this process will be checked manually by the payai team
                                - later on we will add an agent to evaluate the work and automatically release the funds



## PayAI V2 Architecture
  
### Frontend
- Next.js
- TailwindCSS
- Shadcn UI

### Backend
- Node.js
- Hono

### Database
- Supabase
    - Postgres

### Smart Contracts
    - Solana
    - Anchor

### PayAI MCP Server
    - Browse Agents
    - Make Offers
    - Accept Offers
    - Deliver Work
    - Release Funds

### X Agent Making Offers
- Eliza Agent with X Plugin
- PayAI MCP Server


### PayAI SDK
- This will be a simple to install package that will allow the agent to deliver their work and get paid.

### Plan To Deliver Daily For Keep Community Bullish AF
1. Start with the frontend
    a. Can start basic but must be deployed
    b. Add coming soon labels for everything that still needs to be built
    c. Start with mock data

    deliverable: basic frontend with mock data

2. Move on to MCP server
    a. Start developing the Make Offer tool
        1. This will force us to start building the backend
    b. Make offer should allow the user to specify an agent, a payment amount, and a request, e.g. "@dolos_diary write me a birthday message for my friend for 0.5 SOL"

    c. Use mock data as well... the MCP server can send the offer to stdio.

    deliverable: MCP server with Make Offer tool

3. Move on to the backend
    a. Setup the backend routes and the database
        1. allow me to create a new offer using the mcp server
        2. there will be no authentication yet -- anyone can create an offer
        3. once the backend receives the offer, it should store in the database and echo the offer back to the user

    b. Routes needed
        /api/offers
            - POST
                - create a new offer
                - require the following fields:
                    - agent_id
                    - payment_amount
                    - request description
                - return the offer
                    - payment link id
                    - agent id
                    - payment amount
                    - request description
                    
        /api/offers/:id
            - GET
                - return the offer

    c. Setup the database to support the data mentioned above


    deliverable: MCP server receives the offer that it creates

4. Go back to frontend
    a. Wire up the following details 
        1. payment link id
        2. agent id
        3. payment amount
        4. request description

5. Let MCP server fetch payment link and its data

    Deliverable: user can fetch payment link using MCP server, and get a similar display as the frontend

6. Start smart contract development
    a. Allow funding of escrow account
        1. backend has to derive the same PDA that the smart contract would derive
            a. seeds will include: 
                1. payment link id
    
    Deliverable: a screenshot or video showing the ability to fund escrow payments

7. Listen for the escrow funding event by the backend
    a. subscribe to RPC server to know when the escrow was funded
    b. once the escrow is funded
        1. update the payment link status from pending to funded
        2. update frontend to show
            a. the payment link status should say funded
            b. there should be instructions for the AI agent developer to download the PayAI SDK and get started as easily as possible
                1. this can say coming soon

    Deliverable: showing the frontend say FUNDED and have a coming soon label for instructions on PayAI SDK

8. Move on to the PayAI SDK
    1. look for new jobs
        a. polling
            1. SDK provides an easy way for agent to poll for any new jobs
                a. this will require an endpoint on the backend that allows an agent to see all of their contracts
                    1. filter it by status: funded
            2. If new jobs exist, send the agent the details and let them run their code via callback
                a. agent should mark the job as in progress to protect themselves from the buyer withdrawing funds while they do work

    Deliverable: screenshot or video of an agent seeing 3 funded jobs


9. More PayAI SDK
        2. allow the agent to deliver their work to the buyer
            a. SDK should provide agent with a way to submit proof of their work, i.e. a link pointing to the content that they created
            b. allow the agent to claim their funds


