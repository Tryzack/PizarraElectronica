module.exports = io => {

  let line_history = [];

  io.on('connection', socket => {
    for (let i in line_history) {
      socket.emit('draw_line', {line: line_history[i]});
    }

    socket.on('draw_line', data => {
      line_history.push(data.line);
      io.emit('draw_line', { line: data.line });
    });

    socket.on('change_color', data => {
      io.emit('change_color', data);
    });

    
    socket.on('clear_canvas', () => {
      line_history = [];
      io.emit('clear_canvas');
    });
  });
};
