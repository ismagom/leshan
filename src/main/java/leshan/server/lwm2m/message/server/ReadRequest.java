/*
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
package leshan.server.lwm2m.message.server;

import org.apache.commons.lang.Validate;
import org.apache.commons.lang.math.RandomUtils;
import org.apache.mina.coap.CoapMessage;

/**
 * The request to access the value of a Resource, an array of Resource Instances, an Object Instance or all the Object
 * Instances of an Object.
 */
public class ReadRequest implements ServerRequest {

    private final int id;

    private final Integer objectId;

    private final Integer objectInstanceId;

    private final Integer resourceId;
    
    private final boolean is_observe;

    public ReadRequest(Integer objectId, Integer objectInstanceId, Integer resourceId, boolean is_observe) {
        Validate.notNull(objectId);

        this.id = RandomUtils.nextInt() & 0xFFFF;

        // TODO check unsigned short

        this.objectId = objectId;
        this.objectInstanceId = objectInstanceId;
        this.resourceId = resourceId;
        this.is_observe = is_observe;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public int getId() {
        return id;
    }
    
    public boolean isObserve() {
    	return is_observe;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Object requestId() {
        return id;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public CoapMessage encode(MessageEncoder visitor) {
        return visitor.encode(this);
    }

    public Integer getObjectId() {
        return objectId;
    }

    public Integer getObjectInstanceId() {
        return objectInstanceId;
    }

    public Integer getResourceId() {
        return resourceId;
    }

    @Override
    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("ReadRequest [id=").append(id).append(", objectId=").append(objectId)
                .append(", objectInstanceId=").append(objectInstanceId).append(", resourceId=").append(resourceId)
                .append("]");
        return builder.toString();
    }

}
