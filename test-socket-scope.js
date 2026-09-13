#!/usr/bin/env node

const { io } = require('socket.io-client');
const http = require('http');

// Test script to verify socket error scoping

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testErrorScopes() {
  console.log('Testing socket error scopes...\n');

  // First, login to get a valid token
  console.log('Logging in as cavetest2...');
  let loginResult;
  try {
    loginResult = await makeRequest('POST', '/api/login', { username: 'cavetest2', password: 'senha123' });
  } catch (e) {
    console.error('Login failed:', e.message);
    process.exit(1);
  }

  if (!loginResult.token) {
    console.error('Login failed:', loginResult.error || 'No token returned');
    process.exit(1);
  }

  console.log('Login successful, token obtained\n');

  // Connect to server on localhost:3001
  const socket = io('http://localhost:3001', {
    auth: {
      token: loginResult.token
    }
  });

  socket.on('connect', async () => {
    console.log('Connected to server\n');

    // Test 1: Room-level error (join a game user is NOT a member of)
    console.log('=== TEST 1: Room-level error ===');
    console.log('Attempting to join game 99999 (not a member)...');
    socket.emit('join_room', 99999);

    socket.once('error', (payload) => {
      console.log('Received error event:', JSON.stringify(payload, null, 2));
      if (payload?.scope === 'room') {
        console.log('✓ PASS: scope is "room" as expected\n');
      } else {
        console.log('✗ FAIL: scope is not "room"\n');
      }

      // Test 2: Action-level error (try to move non-existent token)
      console.log('=== TEST 2: Action-level error ===');
      console.log('Joining game 5 (as member)...');
      socket.emit('join_room', 5);

      socket.once('token_moved', () => {
        // This event shouldn't fire, but if it does, wait
      });

      // Give the join_room a moment to complete
      setTimeout(() => {
        console.log('Attempting to move token 999999 (non-existent)...');
        socket.emit('move_token', { tokenId: 999999, x: 100, y: 100 });

        socket.once('error', (payload) => {
          console.log('Received error event:', JSON.stringify(payload, null, 2));
          if (payload?.scope === 'action') {
            console.log('✓ PASS: scope is "action" as expected\n');
          } else {
            console.log('✗ FAIL: scope is not "action"\n');
          }

          console.log('=== All tests completed ===');
          socket.disconnect();
          process.exit(0);
        });
      }, 500);
    });
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    process.exit(1);
  });

  // Timeout after 10 seconds
  setTimeout(() => {
    console.error('Test timeout');
    socket.disconnect();
    process.exit(1);
  }, 10000);
}

testErrorScopes();
