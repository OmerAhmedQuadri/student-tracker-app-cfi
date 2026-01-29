cd client 
rm -rf dist 
rm -rf ../client/dist
pnpm build
mv dist ../server/src 

cd ../server
pnpm dev
