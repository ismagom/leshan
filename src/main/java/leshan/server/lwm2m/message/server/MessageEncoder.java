package leshan.server.lwm2m.message.server;

import org.apache.mina.coap.CoapMessage;

/**
 * A visitor to encode the server messages into CoAP messages
 */
public interface MessageEncoder {

    CoapMessage encode(CreatedResponse message);

    CoapMessage encode(DeletedResponse message);

    CoapMessage encode(ErrorResponse message);

    CoapMessage encode(ReadRequest message);

    CoapMessage encode(ExecRequest message);

    CoapMessage encode(WriteRequest message);

}
