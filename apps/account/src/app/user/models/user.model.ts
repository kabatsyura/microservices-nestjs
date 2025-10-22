import { Document, Types } from 'mongoose';
import { IUser } from '@purple/interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserRole } from 'interfaces/src/lib/user.interface';
import { UserCourses, UserCourseSchema } from './userCourses.model';

@Schema()
export class User extends Document<string> implements IUser {
  @Prop()
  displayName?: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    required: true,
    enum: UserRole,
    type: String,
    default: UserRole.Student,
  })
  role: UserRole;

  @Prop({ type: [UserCourseSchema], _id: false })
  courses?: Types.Array<UserCourses>;
}

export const UserSchema = SchemaFactory.createForClass(User);
