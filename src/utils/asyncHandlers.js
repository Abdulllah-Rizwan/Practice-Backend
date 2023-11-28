export const asyncHandler = async (requestHandler) => {
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next))
        .catch((err) => next(err))
    }
}

