const http = require('http');
const fs = require('fs');

let votes = {
    option1: 0,
    option2: 0,
};

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write('data: ' + JSON.stringify(votes) + '\n\n');

    // Função para enviar atualizações de votos a cada 5 segundos
    const intervalId = setInterval(() => {
        res.write('data: ' + JSON.stringify(votes) + '\n\n');
    }, 5000);

    req.on('close', () => {
        clearInterval(intervalId);
    });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});

// Endpoint para receber votos
http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/vote') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { option } = JSON.parse(body);
            if (option === 'option1' || option === 'option2') {
                votes[option]++;
                res.end('Vote counted successfully.');
            } else {
                res.statusCode = 400;
                res.end('Invalid option.');
            }
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
}).listen(3001, () => {
    console.log('Vote endpoint running at http://localhost:3001/');
});
