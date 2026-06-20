#!/bin/bash

# Update packages and install prerequisites
sudo apt update -y
sudo apt upgrade -y
sudo apt install curl git ufw -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 and Nginx
sudo npm install -g pm2
sudo apt install nginx -y

# Setup firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

echo "EC2 Setup Complete! You can now clone your repository here."
echo "Once cloned, navigate to the server folder and run: npm install && pm2 start server.js"
echo "Then, configure Nginx to serve the client folder."
