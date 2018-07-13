import Hokku from 'hokku-node';

const {def, hook, fire} = Hokku({});

function watch(actionSet) { // (actionSet, firedAction) {
    // let firedAct = [];
    // if (firedAction) {
    //     firedAct = firedAction.map ? firedAction : [firedAction];
    // }

    function initField(target, property, desc) {
        let value = desc.initializer();

        hook(actionSet, action => {
            value = action.payload;
        })

        delete desc.initializer;
        delete desc.writable;

        desc.get = function() {
            return value;
        }
        desc.set = function() {
        }

        return desc;
    }

    function initMethod(target, property, desc) {
        hook(actionSet, action => {
            desc.value.call(undefined, action.payload, action.type);
        })

        desc.writable = false;

        return desc;
    }

    return function (target, property, desc) {
        // console.log(target);

        if (desc.value) {
            initMethod(target, property, desc);
        } else {
            initField(target, property, desc);
        }
    }
}

function storage(dbUrl) {
    return function (target) {
        target.prototype.save = function () {
            console.log(`prototype.save -> ${dbUrl}`);
            // for (let key in this) {
            //     console.log(`val: ${key} == ${this[key]}`);
            // }
        }
    }
}

class User {
    id = null;
    name = '';
    email = '';

    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}

const addUser = def();
const rmUser = def();
const editUser = def();
const showInfo = def();

class UserStore {
    users = new Map();

    @watch(addUser)
    addUser(user) {
        console.log(this);
        this.users.set(user.id, user);
    }

    @watch(rmUser)
    rmUser(user) {
        this.users.delete(user.id);
    }
}

const userStore = new UserStore();

const {select} = new Hokku({
    ready() {
        addUser(new User(1, 'name-1', 'email-1'));
        addUser(new User(2, 'name-2', 'email-2'));
        addUser(new User(3, 'name-3', 'email-3'));

        showInfo();
    }
});

hook(showInfo, e => {
    console.log('*** INFO ***');
    console.log(userStore.users);
    for (var [uid, user] of userStore.users) {
        console.log(uid + " = " + JSON.stringify(user));
    }
});
