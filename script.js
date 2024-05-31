let tasks = [];
let editIndex = -1;
let isDarkMode = false;

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const taskPriority = document.getElementById('taskPriority');
    const taskCategory = document.getElementById('taskCategory');
    const taskRecurring = document.getElementById('taskRecurring');
    const taskDescription = document.getElementById('taskDescription');
    const taskFile = document.getElementById('taskFile').files[0];
    
    const task = taskInput.value;
    const date = taskDate.value;
    const priority = taskPriority.value;
    const category = taskCategory.value;
    const recurring = taskRecurring.value;
    const description = taskDescription.value;
    
    if (task) {
        const fileURL = taskFile ? URL.createObjectURL(taskFile) : null;
        tasks.push({ task, date, priority, category, recurring, description, completed: false, subtasks: [], fileURL });
        taskInput.value = '';
        taskDate.value = '';
        taskPriority.value = 'Medium';
        taskCategory.value = '';
        taskRecurring.value = 'none';
        taskDescription.value = '';
        document.getElementById('taskFile').value = null;
        renderTasks();
    }
}

function editTask(index) {
    const task = tasks[index];
    document.getElementById('editTaskInput').value = task.task;
    document.getElementById('editTaskDate').value = task.date;
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskCategory').value = task.category;
    document.getElementById('editTaskRecurring').value = task.recurring;
    document.getElementById('editTaskDescription').value = task.description;
    editIndex = index;
    $('#editModal').modal('show');
}

function saveTask() {
    const task = document.getElementById('editTaskInput').value;
    const date = document.getElementById('editTaskDate').value;
    const priority = document.getElementById('editTaskPriority').value;
    const category = document.getElementById('editTaskCategory').value;
    const recurring = document.getElementById('editTaskRecurring').value;
    const description = document.getElementById('editTaskDescription').value;
    const file = document.getElementById('editTaskFile').files[0];
    
    if (task && editIndex > -1) {
        const fileURL = file ? URL.createObjectURL(file) : tasks[editIndex].fileURL;
        tasks[editIndex] = { ...tasks[editIndex], task, date, priority, category, recurring, description, fileURL };
        editIndex = -1;
        renderTasks();
        $('#editModal').modal('hide');
    }
}

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

function searchTasks() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredTasks = tasks.filter(task => 
        task.task.toLowerCase().includes(searchInput) ||
        task.category.toLowerCase().includes(searchInput)
    );
    renderTasks(filteredTasks);
}

function toggleTaskCompletion(index) {
    tasks[index].completed = !tasks[index].completed;
    renderTasks();
    updateProgress();
}

function renderTasks(taskArray = tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    taskArray.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.className = 'list-group-item';
        taskItem.draggable = true;
        taskItem.ondragstart = (e) => dragStart(e, index);

        const taskInfo = document.createElement('div');
        taskInfo.className = 'task-info';

        const priorityDot = document.createElement('div');
        priorityDot.className = `priority ${task.priority.toLowerCase()}`;
        taskInfo.appendChild(priorityDot);

        const taskText = document.createElement('span');
        taskText.textContent = task.task;
        if (task.completed) {
            taskText.style.textDecoration = 'line-through';
        }
        taskInfo.appendChild(taskText);

        if (task.fileURL) {
            const fileLink = document.createElement('a');
            fileLink.href = task.fileURL;
            fileLink.target = '_blank';
            fileLink.textContent = ' [Attachment]';
            taskInfo.appendChild(fileLink);
        }

        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        const editButton = document.createElement('button');
        editButton.className = 'btn btn-outline-secondary btn-sm';
        editButton.textContent = 'Edit';
        editButton.onclick = () => editTask(index);
        taskActions.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger btn-sm';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteTask(index);
        taskActions.appendChild(deleteButton);

        const toggleCompleteButton = document.createElement('button');
        toggleCompleteButton.className = 'btn btn-outline-success btn-sm';
        toggleCompleteButton.textContent = task.completed ? 'Undo' : 'Complete';
        toggleCompleteButton.onclick = () => toggleTaskCompletion(index);
        taskActions.appendChild(toggleCompleteButton);

        taskItem.appendChild(taskInfo);
        taskItem.appendChild(taskActions);
        taskList.appendChild(taskItem);
    });
    updateProgress();
}

function updateProgress() {
    const completedTasks = tasks.filter(task => task.completed).length;
    const progressPercent = tasks.length ? (completedTasks / tasks.length) * 100 : 0;
    document.getElementById('taskProgress').value = progressPercent;
    document.getElementById('progressPercent').textContent = `${Math.round(progressPercent)}%`;
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    const modalContent = document.querySelector('.modal-content');
    modalContent.classList.toggle('dark-mode', isDarkMode);
}

function sortTasks(criteria) {
    tasks.sort((a, b) => {
        if (criteria === 'priority') {
            const priorities = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return priorities[b.priority] - priorities[a.priority];
        } else if (criteria === 'date') {
            return new Date(a.date) - new Date(b.date);
        } else if (criteria === 'category') {
            return a.category.localeCompare(b.category);
        }
    });
    renderTasks();
}

function dragStart(e, index) {
    e.dataTransfer.setData('text/plain', index);
}

function allowDrop(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('text/plain');
    const targetIndex = [...e.target.parentElement.children].indexOf(e.target);
    tasks.splice(targetIndex, 0, tasks.splice(draggedIndex, 1)[0]);
    renderTasks();
}

function exportTasks() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "tasks.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importTasks() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        tasks = JSON.parse(e.target.result);
        renderTasks();
    }
    reader.readAsText(file);
}

function renderAnalytics() {
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    const completionData = {
        labels: ['Completed', 'Pending'],
        datasets: [{
            label: 'Task Completion',
            data: [tasks.filter(task => task.completed).length, tasks.filter(task => !task.completed).length],
            backgroundColor: ['#28a745', '#dc3545'],
            hoverOffset: 4
        }]
    };
    new Chart(ctx, {
        type: 'pie',
        data: completionData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            }
        },
    });
}

function setLanguage() {
    const lang = document.getElementById('languageSelect').value;
    // Implement localization logic here
    alert(`Language set to ${lang}`);
}

document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    renderAnalytics();

    if (annyang) {
        const commands = {
            'add task *task': (task) => {
                document.getElementById('taskInput').value = task;
                addTask();
            },
            'complete task *task': (task) => {
                const taskIndex = tasks.findIndex(t => t.task.toLowerCase() === task.toLowerCase());
                if (taskIndex > -1) toggleTaskCompletion(taskIndex);
            }
        };
        annyang.addCommands(commands);
        annyang.start();
    }
});

