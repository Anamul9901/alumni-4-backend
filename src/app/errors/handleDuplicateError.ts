/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from '../interface/error';

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  // Extract value within double quotes using regex
  const match = err.message.match(/"([^"]*)"/);

  // The extracted value will be in the first capturing group
  const errField = Object?.keys(err?.keyValue)[0];
  const extractedMessage = match && match[1] || errField;

  const errorSources: TErrorSources = [
    {
      path: '',
      message: extractedMessage,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: `${extractedMessage} is already exist!` || 'Duplicate field value entered',
    // message: err,

    errorSources,
  };
};

export default handleDuplicateError;
