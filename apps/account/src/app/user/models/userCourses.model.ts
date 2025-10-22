import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUserCourses, PurchaseState } from 'interfaces/src/lib/user.interface';

@Schema()
export class UserCourses extends Document<string> implements IUserCourses {
  @Prop({ required: true })
  courseId: string;

  @Prop({ required: true, enum: PurchaseState, type: String })
  purchaseState: PurchaseState;
}

export const UserCourseSchema = SchemaFactory.createForClass(UserCourses);
