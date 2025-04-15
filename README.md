# LLM-Powered Chat Interface
This is an application similar to chatgpt that has been built to sustain 10000+ users!
This repository contains all of the starter code needed to run an LLM-powered chat app on your local machine:
1. Django backend
2. React TypeScript frontend
3. LangChain Agents and LLMs

## Getting Started 🚀
To run the chat app, you need to:

1. Clone this GitHub repo
2. Run the backend server
3. Run the frontend app

### 1. Clone this GitHub repo 📁
To clone this GitHub repo, open up your Terminal (MacOS) or Bash terminal (Windows) and navigate to wherever you want to save this repo on your local machine.  Then, run: 

```
git clone https://github.com/RitikaRege31/LLM-Powered-Chat-Application.git
```

Make sure that you have git installed ([instructions](https://github.com/git-guides/install-git)).

### 2. Run the backend server 🖥️
Once you have this `chat_app` project cloned locally, navigate to the `backend` directory:

```
cd ~/path_to/chat_app/backend
```

Create and activate a virtual environment:

```
python3 -m venv myenv
```

For MacOS/Linux:
```
source myenv/bin/activate
```

For Windows:
```
myenv\Scripts\activate
```

Install the necessary libraries:
```
pip install -r requirements.txt
```

Make sure that you have Redis installed. You can find instructions [here](https://redis.io/docs/getting-started/installation/).
Once installed, run redis:
```
redis-server
```
Alternatively, redis can be run using docker.
Pull the docker image
```
docker pull redis5
```
Once installed, run redis:
```
redis-server
```

Run the backend server:
```
daphne project.asgi:application
```

If your backend server is running correctly, you should see something like this:
```
"WSCONNECTING /ws/chat/" - -
"WSCONNECT /ws/chat/" - -
```

**Important**: In order to run the LLM, set your keys in the .env file 

### 3. Run the frontend app 💻
In a new Terminal window (or tab), navigate to the `frontend` directory:
```
cd ~/path_to/chat_app/frontend
```

Make sure that you have Node and npm installed (MacOS [instructions](https://nodejs.org/en/download/package-manager#macos) and Windows [instructions](https://nodejs.org/en/download/package-manager#windows-1))

Install the necessary packages:
```
npm install
```

Run the frontend app:
```
npm start
```
If successful, your browser should open and navigate to http://localhost:3000/.  The chat app should load automatically.

## Architecture Diagram

           +-----------+          +------------+
           | React.js  |          | Next.js SSR|
           +-----------+          +------------+
                  |                    |
                  v                    v
          +--------------------------------+
          |       Load Balancer (Nginx)    |
          +--------------------------------+
                  |                    |
                  v                    v
    +-------------------+        +-------------------+
    |Django ASGI Server 1|       |Django ASGI Server 2|
    +-------------------+        +-------------------+
               |                        |
               v                        v
          +--------------------------------+
          |  PostgreSQL(DB) + Redis(Cache) |
          +--------------------------------+
                          |
                          v
                  +----------------+
                  |  LLM Providers  |
                  +----------------+

## 1. Overall Approach & Design Philosophy
  1. Scalability First: The architecture ensures load balancing across multiple Django ASGI instances, allowing horizontal scaling; Also Load balancing across multiple LLM Providers (using round robin) allows handling of
  large number of user requests simultaneously
  2. Reliability & Fault Tolerance: API rotation and intelligent caching reduce API exhaustion and ensure fallback strategies.
  3. Performance Optimization: WebSockets enable real-time interaction while Redis handles caching to minimize redundant LLM queries.
  4. Cost Efficiency: Combining free-tier LLM APIs, caching responses, and Rate limiting requests per user optimizes operational costs.

## How the System Handles Scale
### Backend Scaling
1. Horizontal Scaling: Multiple Django ASGI instances handle high concurrent users.
2. Nginx Load Balancer: Distributes traffic efficiently across multiple API servers.
3. WebSockets for Real-Time Chat: Ensures efficient and low-latency communication.
### LLM API Scalability
1. API Rotation: Requests are distributed across multiple LLMs.
2. Intelligent Query Caching: Frequently asked queries are stored to reduce redundant API calls.
3. Rate Limiting: Prevents abuse and helps optimize API quota usage.

## Key technical decisions and their justification
### 1. Using Django ASGI Server
1. Django ASGI Server is chosen for its ability to handle high concurrency and it natively supports WebSockets using django-channels, making it ideal for real-time chat applications.
2. Django ASGI Server supports asynchronous programming, which is beneficial for handling concurrent requests efficiently.
3. Django provides a fully-fledged ecosystem for authentication, database migrations, and security, reducing development time.
4. Django is used in large-scale applications (Instagram, Disqus, Pinterest), proving its stability and scalability.
5. Django’s session-based rate limiting and middleware support allow fine-grained control over API requests.
6. Django’s ORM (Object Relational Mapper) is one of the most powerful, providing automatic migrations, query optimization, and an admin interface.
### 2. Using PostgreSQL(DB) and Redis (Caching)
1. PostgreSQL is chosen for its reliability, scalability, and support for advanced features like transactions and indexing
2. PostgreSQL is best for structured, relational data such as users, chat history, and API usage limits.
3. PostgreSQL supports horizontal scaling (via read replicas) and vertical scaling efficiently.
4. Redis is chosen for its high performance, low latency, and ability to handle large amounts of requests. 
Caches responses and reduces API calls to LLM providers.
### 3. Nginx Load Balancer
Distributes traffic across multiple Django servers for horizontal scaling
### 4. LLM Providers
Load balancing across Multiple LLM Providers Ensures API fallback and optimized performance.


## The Chat App UX 🤖
<img width="1680" alt="Screen Shot 2023-05-17 at 4 52 27 PM" src="https://github.com/virattt/chat_app/assets/901795/2a68d8dd-5d81-4b6f-b815-7e2c22114ec2">


