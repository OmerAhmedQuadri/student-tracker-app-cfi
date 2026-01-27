cd client 
pnpm install 
touch .env.production

pnpm build 
mv dist ../server/src 
cd .. 
cd server 
pnpm install 
touch .env.production

