tasksController = function() {
    var $taskPage;
    var initialised = false;
    var taskCount = 0;

    function updateTaskCount() {
        var count = $taskPage.find("#tblTasks tbody tr").length;
        $('footer').find("#tasksCounter").text(count);
    }

    function errorLogger(errorCode, errorMessage) {
        console.log(errorCode + " : " + errorMessage)
    }

    function clearTask() {
        $taskPage.find("form").fromObject({});
    }

    function bandTableRows() {
        $taskPage.find('#tblTasks tbody tr').removeClass('even');
        $taskPage.find('#tblTasks tbody tr:even').addClass('even');
        overdueAndWarningBands();
    }

    function overdueAndWarningBands() {
        $.each($taskPage.find('#tblTasks tbody tr'), function(index, row) {
            var $row = $(row);
            var dueDate = Date.parse($row.find("[datetime]").text());
            if (dueDate.compareTo(Date.today()) < 0) {
                $row.removeClass('even');
                $row.addClass('overdue');
            } else if (dueDate.compareTo((2).days().fromNow()) <= 0) {
                $row.removeClass('even');
                $row.addClass('warning');
            }
        })
    }

    return {
        init: function(page, callback) {
            if (initialised) {
                callback();
            } else {
                $taskPage = page;

                storageEngine.init(function() {
                    storageEngine.initObjectStore('task', function(){callback();}, errorLogger);
                }, errorLogger);

                $taskPage.find('[required="required"]').prev('label').append('<span>*</span>')
                    .children('span').addClass('required');

                $taskPage.find('#btnAddTask').click(function(evt) {
                    evt.preventDefault();
                    console.log('show task form');
                    $taskPage.find('#taskCreation').removeClass('not');
                });

                $taskPage.find('tbody').on('click', 'td', 'time', function(evt) {
                    $(evt.target).closest('td').siblings().addBack().toggleClass('rowHighlight')
                });

                $taskPage.find('#tblTasks tbody').on('click', '.deleteRow', function(evt){
                    evt.preventDefault();
                    storageEngine.delete('task',$(evt.target).data().taskId, function() {
                        $(evt.target).parents('tr').remove();
                        updateTaskCount();
                        bandTableRows();
                    }, errorLogger);
                });

                /* $taskPage.find('#btnSaveTask').click(function(evt){
                     evt.preventDefault();

                     if ($taskPage.find('form').valid()) {
                         var task = $taskPage.find('#taskForm').toObject();
                         storageEngine.save("task", task, function() {
                             $taskPage.find('#tblTasks tbody').empty();
                             tasksController.loadTasks();
                             // $(':input').val("");
                             clearTask();
                             $taskPage.find('#taskCreation').addClass('not');
                         }, errorLogger)
                     }
                 });*/


                $taskPage.find('#btnDeleteTasks').click(function(){
                    var selectedTasks = $taskPage.find('#tblTasks tbody tr:has(.rowHighlight)');
                    var numberOfTasks = selectedTasks.length;

                    var numberDeleted = 0;
                    if(numberOfTasks > 0) {
                        var response = confirm("Do you want to delete " + numberOfTasks + " tasks?");
                        if (response) {
                            selectedTasks.each(function(i, elem) {
                                idToDelete = parseInt($(elem).find('[data-task-id]').data().taskId);
                                storageEngine.delete('task', idToDelete,
                                    function() {
                                        numberDeleted++;
                                        if(numberDeleted === numberOfTasks) {
                                            selectedTasks.remove();
                                            alert(numberOfTasks + " tasks deleted!");
                                        }
                                    }, errorLogger)
                            })
                        } else {
                            alert('No items deleted');
                        }

                    }
                });

                $taskPage.find('#taskForm').validate({
                    rules: {task: {maxlength: 20}}
                });

                $taskPage.find('#tblTasks tbody').on('click', '.editRow', function(evt) {
                    $taskPage.find('#taskCreation').removeClass('not');
                    storageEngine.findById('task', $taskPage(evt.target).data().taskId,
                        function(task) {
                            $taskPage.find('form').fromObject(task);
                        }, errorLogger);
                });

                $taskPage.find('#clearTask').click(function (evt) {
                    evt.preventDefault();
                    clearTask();
                });

                $taskPage.find('#tblTasks tbody').on('click', '.completeRow', function(evt) {
                    storageEngine.findById('task', $(evt.target).data().taskId, function (task) {
                        task.complete = true;
                        storageEngine.save('task', task, function () {
                            tasksController.loadTasks();
                        }, errorLogger)
                    })
                });


                $taskPage.find('#btnSaveTask').click(function(evt) {
                    evt.preventDefault();
                    if ($taskPage.find('form').valid()) {
                        var task = $taskPage.find('form').toObject();
                        task.complete = false;
                        storageEngine.save("task", task,
                            function() {
                                $taskPage.find('#tblTasks tbody').empty();
                                tasksController.loadTasks();
                                clearTask();
                                $taskPage.find('#taskCreation').addClass('not');
                            }, errorLogger);
                    }
                });

                initialised = true;

            }
        },
        loadTasks: function() {
            $taskPage.find('#tblTasks tbody').empty();
            storageEngine.findAll('task', function(tasks) {
                tasks.sort(function(task1, task2) {
                    var date1, date2;
                    date1 = Date.parse(task1.requiredBy);
                    date2 = Date.parse(task2.requiredBy);

                    return date1.compareTo(date2);
                });

                $.each(tasks, function(index, task) {
                    $('#taskRow').tmpl(task).appendTo($taskPage.find('#tblTasks tbody'));
                });
                updateTaskCount();
                bandTableRows();
            }, errorLogger);
        }
    }
}();
