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
package leshan.server.lwm2m.session;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Registry for all the connected LW M2M clients.
 */
public class SessionRegistry {

    private Map<String, LwSession> sessions = new HashMap<>();

    private List<RegistryListener> listeners = new ArrayList<>();

    public void add(LwSession session) {
        sessions.put(session.getEndpoint(), session);
        for (RegistryListener l : listeners) {
            l.registered(session);
        }
    }

    public void remove(LwSession session) {
        sessions.remove(session.getEndpoint());
        for (RegistryListener l : listeners) {
            l.unregistered(session);
        }
    }

    public Collection<LwSession> allSessions() {
        return sessions.values();
    }

    public void addListener(RegistryListener listener) {
        listeners.add(listener);
    }

    public LwSession getSession(String endpoint) {
        return sessions.get(endpoint);
    }
}