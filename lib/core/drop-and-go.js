var DropAndGo = function ( _dg_options ) {

  /*object refercence*/

  var _dg_ = this;

  _dg_.options = _dg_options;

  /*Oggetto Client*/

  /*
  *
  * Si occupa di gestire le chiamate AJAX
  *
  */

  var Client = function () {

    var _client_ = this;

    _client_.STATUS = {

      OK : 200,
      ERROR : {

        BAD_REQUEST : 400,
        UNAUTHORIZED : 401,
        FORBIDDEN : 403,
        NOT_FOUND : 404,
        METHOD_NOT_ALLOWED : 405,
        NOT_ACCEPTABLE : 406,
        PROXY_AUTHENTICATION_REQUIRED : 407,
        REQUEST_TIMEOUT : 408,
        CONFLICT : 409,
        GONE : 410,
        LENGTH_REQUIRED : 411,
        PRECONDITION_FAILED : 412,
        PAYLOAD_TOO_LARGE : 413,
        URI_TOO_LONG : 414,
        UNSUPPORTED_MEDIA_TYPE : 415,
        RANGE_NOT_SATISFIABLE : 416,
        EXPECTATION_FAILED : 417,
        UPGRADE_REQUIRED : 426,
        PRECONDITION_REQUIRED : 428,
        TOO_MANY_REQUEST : 429,
        REQUEST_HEADER_FIELDS_TOO_LARGE : 431,
        UNAVAILABLE_FOR_LEGAL_REASON : 451,
        INTERNAL_SERVER_ERROR : 500,
        NOT_IMPLEMENTED : 501,
        BAD_GATEWAY : 502,
        SERVICE_UNAVAILABLE : 503,
        GATEWAY_TIMEOUT : 504,
        HTTP_VERSION_NOT_SUPPORTED : 505,
        NETWORK_AUTHENTICATION_REQUIRED : 511

      }

    };

    _client_.xhr = null;
    _client_.EXPECTS_JSON = false;

    //inizializza l'oggetto xhr

    var init_xhr = function () {

      _client_.xhr = new XMLHttpRequest();

    };

    //invia i dati al server secondo le impostazioni passate dall'utente

    Client.prototype.send = function ( options, object ) {

      var _o = object || undefined;

      if ( options.expect_json != null )

        _client_.EXPECTS_JSON = true;

      _client_.xhr.open( options.type, options.url, options.async );

      if ( options.headers != null ) {

        if ( typeof options.headers === "object" )

        _client_.headers.forEach( function ( obj, key ) {

          _client_.xhr.setRequestHeader( key, obj );

        } );

      } else {

        //eccezione

      }

      if ( options.type == "GET" )

        _client_.xhr.send();

      else if ( options.type == "POST" ) {

        if ( typeof _o !== "undefined" )

          _client_.xhr.send( _o );

        else {

          //eccezione

        }

      }


    };

    //gestione degli eventi legati all'xhr

    Client.prototype.on = function ( event, callback ) {

      init_xhr();

      switch ( event ) {

        case "beforeSend":

          callback( _client_.xhr );

        break;

        case "afterSend":
        case "success":
        case "error":

          _client_.xhr.onreadystatechange = function ( e ) {

            if ( _client_.xhr.readyState == XMLHttpRequest.DONE ) { //se la richiesta è terminata

                if ( _client_.xhr.status == _client_.STATUS.OK ) { //se la richiesta ha restituito codice 200

                  if ( event == "success" ) { //controllo se l'evento è effettivamente success, ciò impedisce a "complete" di invocare erroneamente questa callback

                    if ( _client_.EXPECTS_JSON == true ) { //se l'utente ha richiesto un json

                      var json = null;

                      try {

                        json = JSON.parse( e.currentTarget.responseText );

                      } catch ( e ) {

                        //eccezione
                        //console.log( e );

                      }

                      callback( e, _client_.STATUS.OK, json );

                    } else {

                      callback( e, _client_.STATUS.OK );

                    }

                  }

                } else { //in caso di errore

                  var err = null;

                  for ( var error in _client_.STATUS.ERROR ) { //vado a scovare il tipo di errore

                    if ( error == _client_.xhr.status ) {

                      err = error;
                      break;

                    }

                  }

                  if ( event == "error" ) { //callback di errore

                    callback( e, err );

                  }

                }

                if ( event == "afterSend" ) //al termine delle operazioni invoco la callback finale, se esiste

                  callback( e );

            }

          }

        break;

        case "loadStart": //eventi di upload

         _client_.xhr.upload.addEventListener( "loadstart", callback );

        break;

        case "load": //eventi di upload

          _client_.xhr.upload.addEventListener( "load", callback );

        break;

        case "progress": //eventi di upload

          _client_.xhr.upload.addEventListener( "progress", callback );

        break;

        case "abort":

          _client_.xhr.upload.addEventListener( "abort", callback );

        break;

        default:

          //eccezione

        break;

      }

    };

  };

  /*Oggetto Language*/

  /*
  *
  * Oggetto che gestisce la localization
  *
  */

  var Language = function () {

    var _lang_ = this;

    _lang_.current_locale = null;
    _lang_.dictionary = null;

    //imposta il locale passato dall'utente e reperisce il json di linguaggio corrispondente

    Language.prototype.setLocale = function ( locale ) {

      var loc_ = locale || undefined;

      if ( typeof loc_ === "undefined" ) {

        //eccezione

      }

      _lang_.current_locale = locale;

      var client = new Client();

      client.on( "success", function ( e, status, json ) {

        _lang_.dictionary = json;

      } );

      client.send( {

        async : false,
        type : "GET",
        url : "lib/core/languages/" + locale + ".json",
        expect_json : true

      } );

    };

    //restituisce il locale impostato dall'utente

    Language.prototype.getLocale = function () {

      return _lang_.current_locale;

    };

    //restituisce il json di lingua, null se il locale non esiste

    Language.prototype.getDictionary = function () {

      return _lang_.dictionary;

    };

  };

  /*Oggetto ExceptionFactory*/

  /*
  *
  * Si occupa di generare le eccezioni, una maniera un po' più intelligente di gestire le eccezioni previste
  *
  */

  var ExceptionFactory = function () {

    var language = new Language();

    //https://stackoverflow.com/questions/9298839/is-it-possible-to-stop-javascript-execution

    var _factory_ = this;

    _factory_.EXCEPTIONS = {

      BROSWER_DEPRECATED_EXCEPTION : function () {

        throw new Error( language.getDictionary().browser_deprecated_exception_label );

      }

    };

    //restituisce l'eccezione passando come parametro il tipo

    ExceptionFactory.prototype.getException = function ( type ) {

      language.setLocale( _dg_.options.localization.lang );

      console.log( type );

      switch ( type ) {

        case "BROWSER_DEPRECATED_EXCEPTION":

          return _factory_.EXCEPTIONS.BROSWER_DEPRECATED_EXCEPTION();

        break;

      }

    };

  };

  /*Oggetto Utils*/

  /*
  *
  * Contiene metodi di utility per il funzionamento della libreria
  *
  */

  var Utils = function () {

    var exception = new ExceptionFactory();
    var client = new Client();

    var _utils_ = this;

    _utils_.ENVIRONMENT = {

      DEPRECATED_BROWSER_FLAG : false,
      USER_AGENT : null,
      DEVICE : null

    };

    _utils_.MIME = null;

    //funzione che setta il json contenente il MIME Type e l'estensione corrispondente

    Utils.prototype.getMIMEJSON = function () {

      client.on( "success", function ( e, status, json ) {

        _utils_.MIME = json;

      } );

      client.send( {

        async : false,
        type : "GET",
        url : "lib/core/json/mime.json",
        expect_json : true

      } );

      return _utils_.MIME;

    };

    //funzione che restituisce l'estensione corrispondente al mime passato come parametro.
    //Se invece l'oggetto MIME non è ancora stato caricato o se come parametro viene passato qualcosa di diverso da una stringa restituisce false.
    //Se il mime non viene trovato, allora viene restituita una stringa vuota

    Utils.prototype.getExtensionByMIME = function ( mime ) {

      if ( _utils_.MIME == null )

        return false;

      if ( typeof mime !== "string" )

        return false;

      var ext = null;

      Object.keys( _utils_.MIME ).forEach( function ( k ) {

        if ( k == mime ) {

          ext = _utils_.MIME[k].replace( ".", "" );

        }

      } );

      return ext == null ? "" : ext;

    };

    //funzione che restituisce il MIME corrispondente all'estensione passata come parametro. ATTENZIONE, se l'estensione è legata a più MIME, viene restituito un Array, altrimenti una stringa.
    //Se invece l'oggetto MIME non è ancora stato caricato o se come parametro viene passato qualcosa di diverso da una stringa restituisce false.
    //Se l'estensione non viene trovata, allora viene restituita una stringa vuota

    Utils.prototype.getMIMEByExtension = function ( ext ) {

      if ( _utils_.MIME == null )

        return false;

      if ( typeof ext !== "string" )

        return false;

      var mime = null;
      var counter = 0;

      Object.keys( _utils_.MIME ).forEach( function ( k ) {

        if ( ext == _utils_.MIME[k].replace( ".", "" ) ) {

          if ( counter > 0 ) {

            var temp = null;

            if ( typeof mime === "string" ) {

              temp = mime;

              mime = new Array();

              mime.push( temp );

            }

            mime.push( k );

          } else {

            mime = k;

          }

          counter++;

        }

      } );

      return mime == null ? "" : mime;

    };

    //funzione che setta le variabili di utility ricavate dall'ambiente dell'utente

    Utils.prototype.getEnvironment = function () {

      _utils_.ENVIRONMENT.DEPRECATED_BROWSER_FLAG = is_browser_deprecated();

      if ( ! _utils_.ENVIRONMENT.DEPRECATED_BROWSER_FLAG ) {

        _utils_.ENVIRONMENT.USER_AGENT = get_user_agent();
        _utils_.ENVIRONMENT.DEVICE = get_device();

        return _utils_.ENVIRONMENT;

      } else {

        //eccezione

        exception.getException( "BROWSER_DEPRECATED_EXCEPTION" );

      }

      return null;

    };

    //restituisce l'oggetto ricavandolo dal dom tramite il suo id

    Utils.prototype.getElementByID = function ( id ) {

      if ( document.getElementById ) {

        return document.getElementById( id );

      }

    };

    //controlla se il browser è deprecato andando a verificare se il metodo getElementById è supportato

    var is_browser_deprecated = function () {

      if ( ! document.getElementById )

        return true;

      else

        return false;

    };

    //restituisce lo user agent

    var get_user_agent = function () {

        if ( navigator ) {

          if ( navigator.userAgent ) {

            return navigator.userAgent;

          } else {

            return false;

          }

        } else {

          return false;

        }


    };

    var get_device = function () {

      if ( /Mobi/i.test( navigator.userAgent ) || /Android/i.test( navigator.userAgent ) ) {

        return "MOBILE";

      } else {

        return "DESKTOP";

      }

    };

  };

  DropAndGo.prototype.test = function () {

    var utility = new Utils();

    console.log( utility.getEnvironment() );
    console.log( utility.getMIMEJSON() );
    console.log( utility.getMIMEByExtension( "mp4" ) );
    console.log( utility.getExtensionByMIME( "applicatssson/xml" ) );

  };

};
