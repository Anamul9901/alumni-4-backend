import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";


const signUpUser = catchAsync(async (req, res) => {
    const result = await UserService.signUpUserIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User registered successfully',
        data: result,
    });
});

const loginUser = catchAsync(async (req, res) => {
    const result = await UserService.loginUser(req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User logged in successfully',
        data: result,
    });
});


const changePassword = catchAsync(async (req, res) => {
    const result = await UserService.changePassword(req.body);


    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password update successfully',
        data: result,
    });
});

const updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    const result = await UserService.updateUser(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User updated successfully',
        data: result,
    });
});

const getMyData = catchAsync(async (req, res) => {
    const result = await UserService.getMyData();
    if (!result) {
        sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: 'User not found',
            data: result,
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
});

const getAllUser = catchAsync(async (req, res) => {
    const result = await UserService.getAllUser(req.query);
    if (!result) {
        sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: 'User not found',
            data: result,
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result,
    });
});

const deleteUser = catchAsync(async (req, res) => {
    const {id} = req.params;
    const user = req.user;
    const result = await UserService.deleteUser(id, user);
    if (!result) {
        sendResponse(res, {
            statusCode: httpStatus.NOT_FOUND,
            success: false,
            message: 'User not found',
            data: result,
        });
    }

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User delete successfully',
        data: result,
    });
});



export const UserControllers = {
    signUpUser,
    loginUser,
    changePassword,
    getMyData,
    updateUser,
    getAllUser,
    deleteUser
};
