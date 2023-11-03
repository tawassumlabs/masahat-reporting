# masahat-reporting

> ⚠️ WARNING - Work in Progress
>
> This script use browser to login to google account and that is not 100% reliable, this is still work in progress

### Deployment Steps
- `cd /home/`
- `git clone git@github.com:tawassumlabs/masahat-reporting.git`
- `cd masahat-reporting`
- add `.env` or contact for .env file
- `docker build -t masahat-reporting:latest .`
- `docker run -p 3000:3000 masahat-reporting`

### Notes:
- testing done on ubuntu 22 (lts)
- smallest digitalocean droplet can't complete docker build command
