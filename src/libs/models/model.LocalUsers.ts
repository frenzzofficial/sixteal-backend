import bcrypt from "bcryptjs";
import sequelize from "../database/db.sequelize";
import { ValidationError } from "../errors/errors.app";
import { emailEndsWith, IUserProfileRoleType } from "../configs/config.data";
import { DataTypes, Model, Optional, ValidationErrorItem } from "sequelize";

export interface ILocalUserAttributes {
  id: number;
  uid: string;
  email: string;
  password: string;
  role: IUserProfileRoleType;
  fullname: string;
  username?: string;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ILocalUserCreationAttributes
  extends Optional<
    ILocalUserAttributes,
    | "id"
    | "uid"
    | "role"
    | "isActive"
    | "emailVerified"
    | "lastLogin"
    | "createdAt"
    | "updatedAt"
  > { }

export class LocalUserModel
  extends Model<ILocalUserAttributes, ILocalUserCreationAttributes>
  implements ILocalUserAttributes {
  public id!: number;
  public uid!: string;
  public email!: string;
  public password!: string;
  public role!: IUserProfileRoleType;
  public fullname!: string;
  public username?: string;
  public avatar?: string;
  public isActive!: boolean;
  public emailVerified!: boolean;
  public lastLogin?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /** Validate plaintext password against stored hash */
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  /** Return safe JSON version without sensitive fields */
  public toJSON(): object {
    const { password, uid, emailVerified, ...safeValues } = this.get();
    return safeValues;
  }

  /** Return public view (for client-facing APIs) */
  public toPublic(): object {
    const { id, email, fullname, username, avatar, role, isActive } = this;
    return { id, email, fullname, username, avatar, role, isActive };
  }

  /** Static helpers */
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  public static async findByEmail(
    email: string
  ): Promise<LocalUserModel | null> {
    return this.findOne({ where: { email: email.toLowerCase().trim() } });
  }
}

/** Helper for domain validation */
function validateTrustedEmail(value: string) {
  if (!emailEndsWith.some((suffix) => value.endsWith(suffix))) {
    throw new ValidationError("Email must be from a trusted domain", []);
  }
}

LocalUserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        isTrusted: validateTrustedEmail,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [8, 255],
      },
    },
    fullname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    role: {
      type: DataTypes.ENUM(...Object.values(IUserProfileRoleType)),
      allowNull: false,
      defaultValue: IUserProfileRoleType.DEFAULT,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: true,
      validate: { len: [1, 64] },
    },
    avatar: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: { len: [1, 100] },
    },
  },
  {
    sequelize,
    modelName: "LocalUsers",
    tableName: "LocalUsers",
    paranoid: true, // Enables soft delete
    timestamps: true,
    hooks: {
      beforeValidate: (user) => {
        if (user.email) user.email = user.email.toLowerCase().trim();
        if (user.username) user.username = user.username.trim();
      },
      beforeUpdate: async (user: LocalUserModel) => {
        if (user.changed("password")) {
          user.password = await LocalUserModel.hashPassword(user.password);
        }
      },
    },
    indexes: [
      { fields: ["email"] },
      { fields: ["uid"] },
      { fields: ["username"], unique: true },
    ],
  }
);

export default LocalUserModel;
