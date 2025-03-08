# Nostr Relay

## Description
NodeJS relay implementation of the Nostr protocol. This project provides a WebSocket-based server that handles Nostr events, messages, and requests.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/nostr-relay.git
   cd nostr-relay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env-base .env
   # Edit .env to set your environment variables
   ```

## Usage
Start the server:
```bash
npm start
```

The server will run on port 8080 by default.

## Components
- **`src/index.js`**: Entry point of the application.
- **`src/server.js`**: WebSocket server implementation.
- **`src/handlers/`**: Contains handlers for messages, events, and requests.
- **`src/db/`**: Database-related files.
- **`src/utils/`**: Utility functions.
- **`src/__test__/`**: Test files.

## Contribution Guidelines
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Create a pull request to the main repository.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
