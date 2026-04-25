package com.javalovers.common.utils;

import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

public class HttpUtils {
    public static URI createURI(UriComponentsBuilder uriComponentsBuilder, String entity, Long id){
        return uriComponentsBuilder.path("/{entity}/{id}").buildAndExpand(entity, id).toUri();
    }

}

