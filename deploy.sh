cd client 
pnpm install 
touch .env.production
rm -rf dist 
rm -rf ../server/src/dist
pnpm build 
mv dist ../server/src 
cd .. 
cd server 
pnpm install 
touch .env.production

