/*
 * User Manager class
 */
import Constants from './constants';

// wrapper class for all user related db functions
export default class UserManager {
  constructor(realm) {
    this._realm = realm;
  }

  get list() {
    return this._realm.objects(Constants.User);
  }

  get getOnlineUsers() {
    return this.list.filtered(`status="${Constants.U_ONLINE}"`);
  }


  // find user by id
  findById(uid) {
    const res = this.list.filtered(`_id = "${uid}"`);
    return (res && res.length > 0) ? res['0'] : null;
  }

    // find user by username
  findByUserName(uname) {
    const res = this.list.filtered(`username = "${uname}"`);
    return (res && res.length > 0) ? res['0'] : null;
  }

    // find user by id
  findByIdAsList(uid) {
    const res = this.list.filtered(`_id = "${uid}"`);
    return (res && res.length > 0) ? res : null;
  }

  // ----- mutation helpers ----

  // callers responsibility to enclose within write txn
  findOrCreate(uid, uname, name) {
    var usr = this.findById(uid);
    if (usr) return usr;
    const tname = name || uname;
    usr = { _id: uid, username: uname, name: tname };
    return this._realm.create(Constants.User, usr, true);
  }

  // TODO bulk status update
  updateStatus(uid, uname, name, ustatus) {
    if (!ustatus) return;
    let usr = this.findById(uid);
    this._realm.write(() => {
      if (usr) {
        usr.status = ustatus;
      } else {
        const temp = name || uname;
        usr = { _id: uid, username: uname, status: ustatus, name: temp };
        this._realm.create(Constants.User, usr, true);
      }
    });
  }

  updateFullUserData(userData) {
    if (!userData) return;
    let usr = this.findById(userData._id);
    const create = !usr;
    this._realm.write(() => {
      if (create) {
        const temp = userData.name || userData.username;
        usr = { _id: userData._id, username: userData.username, name: temp };
        this._realm.create(Constants.User, usr, true);
      }
      if (userData.status) {
        usr.status = userData.status;
      }
      if (userData.active) {
        usr.active = `${userData.active}`;
      }
      if (userData.statusConnection) {
        usr.statusConnection = userData.statusConnection;
      }
      if (userData.utcOffset) {
        usr.utcOffset = `${userData.utcOffset} `;
      }
      if (userData.lastLogin) {
        usr.lastLogin = userData.lastLogin;
      }
      if (userData.createdAt) {
        usr.createdAt = userData.createdAt;
      }
      if (userData.roles && userData.roles.length > 0) {
        let roles = '';
        for (let i = 0; i < userData.roles.length; i += 1) {
          roles += `${userData.roles[i]},`;
        }
        usr.roles = roles;
      }
      if (userData.emails && userData.emails.length > 0) {
        let emails = '';
        for (let i = 0; i < userData.emails.length; i += 1) {
          emails += `${userData.emails[i].address},`;
        }
        usr.emails = emails;
      }
      if (userData.type) {
        usr.type = userData.type;
      }
    });
  }


  getStatus(uid) {
    var usr = this.findById(uid);
    if (usr) return usr.status;
    return null;
  }

}