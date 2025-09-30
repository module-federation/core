import { eventErrorFeedback } from '../../../../telemetry/events/error-feedback';
import { middlewareResponse } from './middleware-response';
// Handles HTTP requests to /__nextjs_error_feedback endpoint for collecting user feedback on error messages
export function getNextErrorFeedbackMiddleware(telemetry) {
    return async function(req, res, next) {
        const { pathname, searchParams } = new URL("http://n" + req.url);
        if (pathname !== '/__nextjs_error_feedback') {
            return next();
        }
        try {
            const errorCode = searchParams.get('errorCode');
            const wasHelpful = searchParams.get('wasHelpful');
            if (!errorCode || !wasHelpful) {
                return middlewareResponse.badRequest(res);
            }
            await telemetry.record(eventErrorFeedback({
                errorCode,
                wasHelpful: wasHelpful === 'true'
            }));
            return middlewareResponse.noContent(res);
        } catch (error) {
            return middlewareResponse.internalServerError(res);
        }
    };
}

//# sourceMappingURL=get-next-error-feedback-middleware.js.map