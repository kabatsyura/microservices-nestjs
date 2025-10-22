import { IUser } from '@purple/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';
import { IUserCourses, UserRole } from 'interfaces/src/lib/user.interface';

export class UserEntity implements IUser {
  _id?: string;
  displayName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses?: IUserCourses[];

  constructor(user: IUser) {
    this._id = user._id;
    this.passwordHash = user.passwordHash;
    this.displayName = user.displayName;
    this.email = user.email;
    this.role = user.role;
    this.courses = user.courses;
  }

  public async setPassword(password: string) {
    const salt = await genSalt(10);
    this.passwordHash = await hash(password, salt);
    return this;
  }

  public validatePassword(password: string) {
    return compare(password, this.passwordHash);
  }

  public updateProfile(displayName: string) {
    this.displayName = displayName;
    return this;
  }

  public getProfileInfo() {
    return {
      displayName: this.displayName,
      email: this.email,
      role: this.role,
    };
  }
}
