import { AccountChangedCourse } from '@purple/contracts';
import { IDomainEvent, IUser } from '@purple/interfaces';
import { compare, genSalt, hash } from 'bcryptjs';
import {
  IUserCourses,
  PurchaseState,
  UserRole,
} from 'interfaces/src/lib/user.interface';

export class UserEntity implements IUser {
  _id?: string;
  displayName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  courses?: IUserCourses[];
  events: IDomainEvent[] = [];

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

  public setCourseStatus(courseId: string, state: PurchaseState) {
    const existedCourse = this.courses.find(
      (course) => course._id === courseId
    );

    if (!existedCourse) {
      this.courses.push({
        courseId: courseId,
        purchaseState: state,
      });

      return this;
    }

    if (state === PurchaseState.Canceled) {
      this.courses = this.courses.filter((course) => course._id !== courseId);
      return this;
    }

    this.courses = this.courses.map((course) => {
      if (course._id === courseId) {
        course.purchaseState = state;
        return course;
      }

      this.events.push({
        topic: AccountChangedCourse.topic,
        data: { userId: this._id, courseId, state },
      });

      return course;
    });
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
