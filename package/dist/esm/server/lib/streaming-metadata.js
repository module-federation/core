import { getBotType, HTML_LIMITED_BOT_UA_RE_STRING } from '../../shared/lib/router/utils/is-bot';
export function shouldServeStreamingMetadata(userAgent, htmlLimitedBots) {
    const blockingMetadataUARegex = new RegExp(htmlLimitedBots || HTML_LIMITED_BOT_UA_RE_STRING, 'i');
    return(// When it's static generation, userAgents are not available - do not serve streaming metadata
    !!userAgent && !blockingMetadataUARegex.test(userAgent));
}
// When the request UA is a html-limited bot, we should do a dynamic render.
// In this case, postpone state is not sent.
export function isHtmlBotRequest(req) {
    const ua = req.headers['user-agent'] || '';
    const botType = getBotType(ua);
    return botType === 'html';
}

//# sourceMappingURL=streaming-metadata.js.map