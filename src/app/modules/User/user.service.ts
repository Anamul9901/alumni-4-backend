import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../errors/AppError";
import { TChangePassword, TLoginUser, TUser } from "./user.interface";
import { User } from "./user.model";
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getUserInfo } from "../../middlewares/auth";

const signUpUserIntoDB = async (payload: TUser) => {
    const result = await User.create(payload);

    const jwtPayload = {
        email: result.email,
        role: result.role,
        userId: result._id,
    };

    const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
        expiresIn: `${config.jwt_access_expires_in}` || '10d',
    });
    return {
        token: accessToken
    };
};

const loginUser = async (payload: TLoginUser) => {
    const isUserExists = await User.findOne({ email: payload.email }).select('+password');
    if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
    }

    const isPasswordMatched = await bcrypt.compare(
        payload.password,
        isUserExists.password
    );
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Password is incorrect!');
    }

    const jwtPayload = {
        email: isUserExists.email,
        role: isUserExists.role,
        userId: isUserExists._id,
    };

    const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
        expiresIn: `${config.jwt_access_expires_in}` || '10d',
    });

    return {
        token: accessToken,
    };
};

const changePassword = async (payload: TChangePassword) => {
    const isUserExists = await User.findOne({ email: payload.email }).select('+password');
    if (!isUserExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
    }

    const isPasswordMatched = await bcrypt.compare(
        payload.oldPassword,
        isUserExists.password
    );
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Previous password is incorrect!');
    }

    const hashedPassword = await bcrypt.hash(
        payload.newPassword,
        Number(config.bcrypt_salt_rounds)
    );

    const updatePassword = await User.updateOne(
        { email: payload.email },
        { password: hashedPassword }
    );

    if (updatePassword.modifiedCount === 0) {
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Password update failed!'
        );
    }

    const jwtPayload = {
        email: isUserExists.email,
        role: isUserExists.role,
        userId: isUserExists._id,
    };

    const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
        expiresIn: '1d',
    });

    return {
        token: accessToken,
    };
};

const updateUser = async (id: string, payload: Partial<TUser>) => {
    const currentUser = getUserInfo();
    if (!currentUser) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    }

    // Only ADMIN can update any user, or Manager can update themselves? 
    // For now assuming ADMIN can update anyone.

    const targetUser = await User.findById(id);
    if (!targetUser) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

    const updateData = { ...payload };

    if (updateData.password) {
        updateData.password = await bcrypt.hash(
            updateData.password,
            Number(config.bcrypt_salt_rounds),
        );
    }

    // Prevent role escalation if needed, but for now trusting ADMIN input.

    const updated = await User.findByIdAndUpdate(id, updateData, {
        new: true,
    }).select('-password');

    if (!updated) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    return updated;
};

const getMyData = async () => {
    const user = getUserInfo();
    if (!user) throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
    const result = await User.findOne({ email: user.email });
    return result;
};

const getAllUser = async (query?: Record<string, any>) => {
    const filterQuery: Record<string, any> = { isDeleted: { $ne: true } };
    if (query?.searchTerm) {
        filterQuery.$or = [
            { name: { $regex: query.searchTerm, $options: 'i' } },
            { email: { $regex: query.searchTerm, $options: 'i' } },
        ];
    }
    const result = await User.find(filterQuery).sort({ createdAt: -1 });
    return result;
}

const deleteUser = async (id: string, user: JwtPayload) => {
    if (user.userId == id)
        throw new AppError(httpStatus.BAD_REQUEST, 'You can not delete your own account');
    const result = await User.findByIdAndDelete(id);
    return result;
}


export const UserService = {
    signUpUserIntoDB,
    loginUser,
    changePassword,
    getMyData,
    updateUser,
    getAllUser,
    deleteUser,
};