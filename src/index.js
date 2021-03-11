const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;


  const user = users.find(users => users.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({ error: 'User Already exists'});
  }

  const user = {
    id: uuid(),
    name: name,
    username: username,
    todos: []
  }

  users.push(user);

  return response.json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
   const { user } = request;
   const { title, deadline } = request.body;
   
   const task = {
     id: uuid(),
     title: title,
     done: false,
     deadline: new Date(deadline),
     created_at: new Date()
   }

   user.todos.push(task);

   return response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
   const { id } = request.params;
   const { user } = request;
   const { title, deadline } = request.body;

   const task = user.todos.find(tasks => tasks.id === id);

  if(!task) {
    return response.status(404).json({ error: 'Task does not exists !' });
  }

  task.title = title;
  task.deadline = new Date(deadline);

  return response.json(task);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const task = user.todos.find(tasks => tasks.id === id);

  if(!task) {
    return response.status(404).json({ error: 'task not found '});
  }

  task.done = true;

  return response.status(201).json(task);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
   const { user } = request;
   const { id } = request.params;

   const task = user.todos.find(tasks => tasks.id === id);

   if(!task) {
     return response.status(404).json({ error: 'task not found'});
   }
   
   user.todos.splice(user.todos.indexOf(task), 1);

   return response.status(204).json({ success: 'success on delete task' });
});

module.exports = app;