package leshan.server.lwm2m.message.client;

import java.util.Arrays;

import leshan.server.lwm2m.message.ContentFormat;
import leshan.server.lwm2m.message.ResponseCode;

import org.apache.commons.lang.Validate;

/**
 * A response with content from the LW-M2M client.
 */
public class ContentResponse extends ClientResponse {

    private final byte[] content;

    private final ContentFormat format;
    
    private final boolean is_changed;

    public ContentResponse(int id, byte[] content, ContentFormat format, boolean is_changed) {
        super(id, ResponseCode.CONTENT);

        Validate.notNull(format);

        this.content = content;
        this.format = format;
        this.is_changed = is_changed;
    }
    
    public boolean isChanged() {
    	return this.is_changed;
    }

    public byte[] getContent() {
        return content;
    }

    public ContentFormat getFormat() {
        return format;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("ContentResponse [content=").append(Arrays.toString(content)).append(", format=").append(format)
                .append(", id=").append(id).append(", code=").append(code).append("]");
        return builder.toString();
    }

}
