var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var __await = function(promise, isYieldStar) {
  this[0] = promise;
  this[1] = isYieldStar;
};
var __asyncGenerator = (__this, __arguments, generator) => {
  var resume = (k, v, yes, no) => {
    try {
      var x = generator[k](v), isAwait = (v = x.value) instanceof __await, done = x.done;
      Promise.resolve(isAwait ? v[0] : v).then((y) => isAwait ? resume(k === "return" ? k : "next", v[1] ? { done: y.done, value: y.value } : y, yes, no) : yes({ value: y, done })).catch((e) => resume("throw", e, yes, no));
    } catch (e) {
      no(e);
    }
  }, method = (k) => it[k] = (x) => new Promise((yes, no) => resume(k, x, yes, no)), it = {};
  return generator = generator.apply(__this, __arguments), it[__knownSymbol("asyncIterator")] = () => it, method("next"), method("throw"), method("return"), it;
};
var __forAwait = (obj, it, method) => (it = obj[__knownSymbol("asyncIterator")]) ? it.call(obj) : (obj = obj[__knownSymbol("iterator")](), it = {}, method = (key, fn) => (fn = obj[key]) && (it[key] = (arg) => new Promise((yes, no, done) => (arg = fn.call(obj, arg), done = arg.done, Promise.resolve(arg.value).then((value) => yes({ value, done }), no)))), method("next"), method("return"), it);

// src/glue/messages.ts
var GLUE_VERSION = 1;
var GLUE_MESSAGE_PROTOTYPES = {
  "erro_evt": {
    "name": "erro_evt",
    "structName": "glue_msg_error",
    "className": "GlueMsgError",
    "fields": [
      {
        "type": "str",
        "name": "message",
        "isNullable": false
      }
    ]
  },
  "load_req": {
    "name": "load_req",
    "structName": "glue_msg_load_req",
    "className": "GlueMsgLoadReq",
    "fields": [
      {
        "type": "arr_str",
        "name": "model_paths",
        "isNullable": false
      },
      {
        "type": "str",
        "name": "mmproj_path",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "n_ctx_auto",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "use_mmap",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "use_mlock",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_gpu_layers",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_ctx",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_threads",
        "isNullable": false
      },
      {
        "type": "str",
        "name": "model_alias",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "log_level",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "embeddings",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "offload_kqv",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_batch",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_ubatch",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_parallel",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "pooling_type",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "rope_scaling_type",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "rope_freq_base",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "rope_freq_scale",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "yarn_ext_factor",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "yarn_attn_factor",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "yarn_beta_fast",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "yarn_beta_slow",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "yarn_orig_ctx",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "cache_type_k",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "cache_type_v",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "kv_unified",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "flash_attn",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "swa_full",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_ctx_checkpoints",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "checkpoint_min_step",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "chat_template",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "jinja",
        "isNullable": true
      },
      {
        "type": "arr_str",
        "name": "default_template_kwargs_keys",
        "isNullable": true
      },
      {
        "type": "arr_str",
        "name": "default_template_kwargs_vals",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "reasoning",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "image_min_tokens",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "image_max_tokens",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "warmup",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "no_kv_offload",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "mmproj_offload",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "cont_batching",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_keep",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "ctx_shift",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "cache_idle_slots",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "n_cache_reuse",
        "isNullable": true
      },
      {
        "type": "arr_str",
        "name": "lora_paths",
        "isNullable": true
      },
      {
        "type": "arr_float",
        "name": "lora_scales",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "lora_init_without_apply",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "spec_draft_model",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "spec_draft_ngl",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "spec_draft_n_max",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "spec_draft_n_min",
        "isNullable": true
      },
      {
        "type": "float",
        "name": "spec_draft_p_min",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "spec_draft_threads",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "spec_draft_threads_batch",
        "isNullable": true
      },
      {
        "type": "arr_str",
        "name": "kv_overrides_keys",
        "isNullable": true
      },
      {
        "type": "arr_str",
        "name": "kv_overrides_vals",
        "isNullable": true
      },
      {
        "type": "int",
        "name": "reasoning_budget_tokens",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "reasoning_budget_message",
        "isNullable": true
      },
      {
        "type": "str",
        "name": "reasoning_format",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "skip_chat_parsing",
        "isNullable": true
      },
      {
        "type": "bool",
        "name": "prefill_assistant",
        "isNullable": true
      }
    ]
  },
  "load_res": {
    "name": "load_res",
    "structName": "glue_msg_load_res",
    "className": "GlueMsgLoadRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_ctx",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_batch",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_ubatch",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_vocab",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_ctx_train",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_embd",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_layer",
        "isNullable": false
      },
      {
        "type": "arr_str",
        "name": "metadata_key",
        "isNullable": false
      },
      {
        "type": "arr_str",
        "name": "metadata_val",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "token_bos",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "token_eos",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "token_eot",
        "isNullable": false
      },
      {
        "type": "arr_int",
        "name": "list_tokens_eog",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "add_bos_token",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "add_eos_token",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "has_encoder",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "token_decoder_start",
        "isNullable": false
      },
      {
        "type": "str",
        "name": "media_marker",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "has_image_input",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "has_audio_input",
        "isNullable": false
      }
    ]
  },
  "cmpl_req": {
    "name": "cmpl_req",
    "structName": "glue_msg_completion_req",
    "className": "GlueMsgCompletionReq",
    "fields": [
      {
        "type": "bool",
        "name": "is_chat",
        "isNullable": false
      },
      {
        "type": "str",
        "name": "data_json",
        "isNullable": false
      },
      {
        "type": "arr_raw",
        "name": "files",
        "isNullable": false
      }
    ]
  },
  "cmpl_res": {
    "name": "cmpl_res",
    "structName": "glue_msg_completion_res",
    "className": "GlueMsgCompletionRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "req_id",
        "isNullable": false
      }
    ]
  },
  "embd_req": {
    "name": "embd_req",
    "structName": "glue_msg_embedding_req",
    "className": "GlueMsgEmbeddingReq",
    "fields": [
      {
        "type": "str",
        "name": "data_json",
        "isNullable": false
      },
      {
        "type": "arr_raw",
        "name": "files",
        "isNullable": false
      }
    ]
  },
  "embd_res": {
    "name": "embd_res",
    "structName": "glue_msg_embedding_res",
    "className": "GlueMsgEmbeddingRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "req_id",
        "isNullable": false
      }
    ]
  },
  "rrnk_req": {
    "name": "rrnk_req",
    "structName": "glue_msg_rerank_req",
    "className": "GlueMsgRerankReq",
    "fields": [
      {
        "type": "str",
        "name": "data_json",
        "isNullable": false
      }
    ]
  },
  "rrnk_res": {
    "name": "rrnk_res",
    "structName": "glue_msg_rerank_res",
    "className": "GlueMsgRerankRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "req_id",
        "isNullable": false
      }
    ]
  },
  "gres_req": {
    "name": "gres_req",
    "structName": "glue_msg_get_result_req",
    "className": "GlueMsgGetResultReq",
    "fields": [
      {
        "type": "int",
        "name": "req_id",
        "isNullable": false
      }
    ]
  },
  "gres_res": {
    "name": "gres_res",
    "structName": "glue_msg_get_result_res",
    "className": "GlueMsgGetResultRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "has_more",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "is_error",
        "isNullable": false
      },
      {
        "type": "str",
        "name": "data_json",
        "isNullable": false
      }
    ]
  },
  "cncl_req": {
    "name": "cncl_req",
    "structName": "glue_msg_cancel_req",
    "className": "GlueMsgCancelReq",
    "fields": [
      {
        "type": "int",
        "name": "req_id",
        "isNullable": false
      }
    ]
  },
  "cncl_res": {
    "name": "cncl_res",
    "structName": "glue_msg_cancel_res",
    "className": "GlueMsgCancelRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      }
    ]
  },
  "tbop_req": {
    "name": "tbop_req",
    "structName": "glue_msg_test_backend_ops_req",
    "className": "GlueMsgTestBackendOpsReq",
    "fields": [
      {
        "type": "arr_str",
        "name": "args",
        "isNullable": false
      }
    ]
  },
  "tbop_res": {
    "name": "tbop_res",
    "structName": "glue_msg_test_backend_ops_res",
    "className": "GlueMsgTestBackendOpsRes",
    "fields": [
      {
        "type": "int",
        "name": "retcode",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      }
    ]
  },
  "revl_req": {
    "name": "revl_req",
    "structName": "glue_msg_raw_eval_req",
    "className": "GlueMsgRawEvalReq",
    "fields": [
      {
        "type": "bool",
        "name": "reset",
        "isNullable": false
      },
      {
        "type": "arr_int",
        "name": "tokens",
        "isNullable": false
      }
    ]
  },
  "revl_res": {
    "name": "revl_res",
    "structName": "glue_msg_raw_eval_res",
    "className": "GlueMsgRawEvalRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_past",
        "isNullable": false
      },
      {
        "type": "raw",
        "name": "logits",
        "isNullable": false
      }
    ]
  },
  "kvsh_req": {
    "name": "kvsh_req",
    "structName": "glue_msg_kv_shift_req",
    "className": "GlueMsgKvShiftReq",
    "fields": [
      {
        "type": "int",
        "name": "n_keep",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_discard",
        "isNullable": false
      }
    ]
  },
  "kvsh_res": {
    "name": "kvsh_res",
    "structName": "glue_msg_kv_shift_res",
    "className": "GlueMsgKvShiftRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_past",
        "isNullable": false
      }
    ]
  },
  "tokn_req": {
    "name": "tokn_req",
    "structName": "glue_msg_tokenize_req",
    "className": "GlueMsgTokenizeReq",
    "fields": [
      {
        "type": "str",
        "name": "text",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "special",
        "isNullable": false
      }
    ]
  },
  "tokn_res": {
    "name": "tokn_res",
    "structName": "glue_msg_tokenize_res",
    "className": "GlueMsgTokenizeRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "arr_int",
        "name": "tokens",
        "isNullable": false
      }
    ]
  },
  "dtkn_req": {
    "name": "dtkn_req",
    "structName": "glue_msg_detokenize_req",
    "className": "GlueMsgDetokenizeReq",
    "fields": [
      {
        "type": "arr_int",
        "name": "tokens",
        "isNullable": false
      },
      {
        "type": "bool",
        "name": "special",
        "isNullable": false
      }
    ]
  },
  "dtkn_res": {
    "name": "dtkn_res",
    "structName": "glue_msg_detokenize_res",
    "className": "GlueMsgDetokenizeRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "raw",
        "name": "text",
        "isNullable": false
      }
    ]
  },
  "vocb_req": {
    "name": "vocb_req",
    "structName": "glue_msg_vocab_req",
    "className": "GlueMsgVocabReq",
    "fields": [
      {
        "type": "bool",
        "name": "special",
        "isNullable": false
      }
    ]
  },
  "vocb_res": {
    "name": "vocb_res",
    "structName": "glue_msg_vocab_res",
    "className": "GlueMsgVocabRes",
    "fields": [
      {
        "type": "bool",
        "name": "success",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "n_vocab",
        "isNullable": false
      },
      {
        "type": "int",
        "name": "token_eos",
        "isNullable": false
      },
      {
        "type": "arr_int",
        "name": "list_tokens_eog",
        "isNullable": false
      },
      {
        "type": "arr_raw",
        "name": "pieces",
        "isNullable": false
      }
    ]
  }
};

// src/glue/glue.ts
var GLUE_MAGIC = new Uint8Array([71, 76, 85, 69]);
var GLUE_DTYPE_NULL = 0;
var GLUE_DTYPE_BOOL = 1;
var GLUE_DTYPE_INT = 2;
var GLUE_DTYPE_FLOAT = 3;
var GLUE_DTYPE_STRING = 4;
var GLUE_DTYPE_RAW = 5;
var GLUE_DTYPE_ARRAY_BOOL = 6;
var GLUE_DTYPE_ARRAY_INT = 7;
var GLUE_DTYPE_ARRAY_FLOAT = 8;
var GLUE_DTYPE_ARRAY_STRING = 9;
var GLUE_DTYPE_ARRAY_RAW = 10;
var TYPE_MAP = {
  str: GLUE_DTYPE_STRING,
  int: GLUE_DTYPE_INT,
  float: GLUE_DTYPE_FLOAT,
  bool: GLUE_DTYPE_BOOL,
  raw: GLUE_DTYPE_RAW,
  arr_str: GLUE_DTYPE_ARRAY_STRING,
  arr_int: GLUE_DTYPE_ARRAY_INT,
  arr_float: GLUE_DTYPE_ARRAY_FLOAT,
  arr_bool: GLUE_DTYPE_ARRAY_BOOL,
  arr_raw: GLUE_DTYPE_ARRAY_RAW,
  null: GLUE_DTYPE_NULL
};
function glueDeserialize(buf) {
  let offset = 0;
  const view = new DataView(buf.buffer);
  const readUint32 = () => {
    const value = view.getUint32(offset, true);
    offset += 4;
    return value;
  };
  const readInt32 = () => {
    const value = view.getInt32(offset, true);
    offset += 4;
    return value;
  };
  const readFloat = () => {
    const value = view.getFloat32(offset, true);
    offset += 4;
    return value;
  };
  const readBool = () => {
    return readUint32() !== 0;
  };
  const readString = (customLen) => {
    const length = customLen != null ? customLen : readUint32();
    const value = new TextDecoder().decode(buf.slice(offset, offset + length));
    offset += length;
    return value;
  };
  const readRaw = () => {
    const length = readUint32();
    const value = buf.slice(offset, offset + length);
    offset += length;
    return value;
  };
  const readArray = (readItem) => {
    const length = readUint32();
    const value = new Array(length);
    for (let i = 0; i < length; i++) {
      value[i] = readItem();
    }
    return value;
  };
  const readNull = () => null;
  const readField = (field) => {
    switch (field.type) {
      case "str":
        return readString();
      case "int":
        return readInt32();
      case "float":
        return readFloat();
      case "bool":
        return readBool();
      case "raw":
        return readRaw();
      case "arr_str":
        return readArray(readString);
      case "arr_int":
        return readArray(readInt32);
      case "arr_float":
        return readArray(readFloat);
      case "arr_bool":
        return readArray(readBool);
      case "arr_raw":
        return readArray(readRaw);
      case "null":
        return readNull();
    }
  };
  const magicValid = buf[0] === GLUE_MAGIC[0] && buf[1] === GLUE_MAGIC[1] && buf[2] === GLUE_MAGIC[2] && buf[3] === GLUE_MAGIC[3];
  offset += 4;
  if (!magicValid) {
    throw new Error("Invalid magic number");
  }
  const version = readUint32();
  if (version !== GLUE_VERSION) {
    throw new Error("Invalid version number");
  }
  const name = readString(8);
  const msgProto = GLUE_MESSAGE_PROTOTYPES[name];
  if (!msgProto) {
    throw new Error(`Unknown message name: ${name}`);
  }
  const output = { _name: name };
  for (const field of msgProto.fields) {
    const readType = readUint32();
    if (readType === GLUE_DTYPE_NULL) {
      if (!field.isNullable) {
        throw new Error(
          `${name}: Expect field ${field.name} to be non-nullable`
        );
      }
      output[field.name] = null;
      continue;
    }
    if (readType !== TYPE_MAP[field.type]) {
      throw new Error(
        `${name}: Expect field ${field.name} to have type ${field.type}`
      );
    }
    output[field.name] = readField(field);
  }
  return output;
}
function glueSerialize(msg) {
  const msgProto = GLUE_MESSAGE_PROTOTYPES[msg._name];
  if (!msgProto) {
    throw new Error(`Unknown message name: ${msg._name}`);
  }
  const bufs = [];
  const writeUint32 = (value) => {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setUint32(0, value, true);
    bufs.push(new Uint8Array(buf));
  };
  const writeInt32 = (value) => {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setInt32(0, value, true);
    bufs.push(new Uint8Array(buf));
  };
  const writeFloat = (value) => {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setFloat32(0, value, true);
    bufs.push(new Uint8Array(buf));
  };
  const writeBool = (value) => {
    writeUint32(value ? 1 : 0);
  };
  const writeString = (value) => {
    const utf8 = new TextEncoder().encode(value);
    writeUint32(utf8.byteLength);
    bufs.push(utf8);
  };
  const writeRaw = (value) => {
    writeUint32(value.byteLength);
    bufs.push(value);
  };
  const writeArray = (value, writeItem) => {
    writeUint32(value.length);
    for (const item of value) {
      writeItem(item);
    }
  };
  const writeNull = () => {
  };
  bufs.push(GLUE_MAGIC);
  writeUint32(GLUE_VERSION);
  {
    const utf8 = new TextEncoder().encode(msg._name);
    bufs.push(utf8);
  }
  for (const field of msgProto.fields) {
    const val = msg[field.name];
    if (!field.isNullable && (val === null || val === void 0)) {
      throw new Error(
        `${msg._name}: Expect field ${field.name} to be non-nullable`
      );
    }
    if (val === null || val === void 0) {
      writeUint32(GLUE_DTYPE_NULL);
      continue;
    }
    writeUint32(TYPE_MAP[field.type]);
    switch (field.type) {
      case "str":
        writeString(val);
        break;
      case "int":
        writeInt32(val);
        break;
      case "float":
        writeFloat(val);
        break;
      case "bool":
        writeBool(val);
        break;
      case "raw":
        writeRaw(val);
        break;
      case "arr_str":
        writeArray(val, writeString);
        break;
      case "arr_int":
        writeArray(val, writeInt32);
        break;
      case "arr_float":
        writeArray(val, writeFloat);
        break;
      case "arr_bool":
        writeArray(val, writeBool);
        break;
      case "arr_raw":
        writeArray(val, writeRaw);
        break;
      case "null":
        writeNull();
        break;
    }
  }
  const totalLength = bufs.reduce((acc, buf) => acc + buf.byteLength, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of bufs) {
    output.set(buf, offset);
    offset += buf.byteLength;
  }
  return output;
}

// src/wasm/source-map.ts
var WASM_SOURCE_MAP = {
  "default": "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",
  "compat": "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"
};

// src/debug.ts
var cache = /* @__PURE__ */ new Map();
function loadMap(buildKey) {
  return __async(this, null, function* () {
    if (cache.has(buildKey)) return cache.get(buildKey);
    const b64 = WASM_SOURCE_MAP[buildKey];
    if (!b64) throw new Error(`No source map for build "${buildKey}"`);
    const gzipped = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();
    writer.write(gzipped);
    writer.close();
    const buf = yield new Response(ds.readable).arrayBuffer();
    const dv = new DataView(buf);
    const bytes = new Uint8Array(buf);
    const firstId = dv.getUint32(0, true);
    const funcCount = dv.getUint32(4, true);
    const numNames = dv.getUint32(8, true);
    const td = new TextDecoder();
    const names = [];
    let pos = 12;
    for (let i = 0; i < numNames; i++) {
      const len = bytes[pos++];
      names.push(td.decode(bytes.subarray(pos, pos + len)));
      pos += len;
    }
    const funcNames = [];
    for (let i = 0; i < funcCount; i++) {
      const idx = dv.getUint16(pos, true);
      pos += 2;
      funcNames.push(idx === 65535 ? null : names[idx]);
    }
    const entry = { firstId, funcNames };
    cache.set(buildKey, entry);
    return entry;
  });
}
var Debug = {
  /**
   * Resolves a list of wasm function indices to their cleaned symbol names.
   */
  decodeFuncIds: (funcIds, isCompatBuild) => __async(void 0, null, function* () {
    const buildKey = isCompatBuild ? "compat" : "default";
    const { firstId, funcNames } = yield loadMap(buildKey);
    return funcIds.map((funcId) => {
      const i = funcId - firstId;
      const name = i >= 0 && i < funcNames.length && funcNames[i] ? funcNames[i] : "(unknown)";
      return { funcId, name };
    });
  }),
  /**
   * Annotates a wasm stack trace string with resolved function names.
   *
   * Example input from Chrome:
   *   at http://localhost:8080/esm/wasm/wllama.wasm:wasm-function[775]:0x74251
   *   at async blob:http://localhost:8080/53a863cc-7227-45cc-8594-ddbbf5257f20:317:28
   *
   * Example input from Firefox:
   *   @http://localhost:8080/esm/wasm/wllama.wasm:wasm-function[796]:0x7dfe2
   *       at wModuleInit/WebAssembly.promising/< (9b6a2acd-d909-44e2-b021-d42fb9087cfb:15:32) index.js:1433:45
   *
   * Example input from Safari:
   *   2441@wasm-function[2441]
   *       at wrapper (d746f19e-4523-4f36-ba06-d0969acc0b05:22:126009)
   *
   * Example output:
   *   wasm-func[775] (server_response::send)
   */
  decodeStackTrace: (stack, isCompatBuild) => __async(void 0, null, function* () {
    const re = /wasm-function\[(\d+)\]/g;
    const funcIds = [
      ...new Set([...stack.matchAll(re)].map((m) => parseInt(m[1])))
    ];
    if (funcIds.length === 0) return stack;
    const resolved = yield Debug.decodeFuncIds(funcIds, isCompatBuild);
    return resolved.map((r) => {
      if (r.name === "(unknown)") {
        return `    wasm-func[${r.funcId}] (unknown)`;
      }
      return `    wasm-func[${r.funcId}] (${r.name})`;
    }).join("\n");
  })
};

// src/utils.ts
var textDecoder = new TextDecoder();
var URL_PARTS_REGEX = /-(\d{5})-of-(\d{5})\.gguf(?:\?.*)?$/;
var parseShardNumber = (fnameOrUrl) => {
  const matches = fnameOrUrl.match(URL_PARTS_REGEX);
  if (!matches) {
    return {
      baseURL: fnameOrUrl,
      current: 1,
      total: 1
    };
  } else {
    return {
      baseURL: fnameOrUrl.replace(URL_PARTS_REGEX, ""),
      current: parseInt(matches[1]),
      total: parseInt(matches[2])
    };
  }
};
var sortFileByShard = (blobs) => {
  const isFiles = blobs.every((b) => !!b.name);
  if (isFiles && blobs.length > 1) {
    const files = blobs;
    files.sort((a, b) => {
      const infoA = parseShardNumber(a.name);
      const infoB = parseShardNumber(b.name);
      return infoA.current - infoB.current;
    });
  }
};
var isMmproj = (blob) => __async(void 0, null, function* () {
  const META_NAME = "general.architecture";
  const META_VAL = "clip";
  const tmp = blob.slice(0, 128 * 1024);
  const header = yield tmp.arrayBuffer();
  const buf = new Uint8Array(header);
  const nameBytes = new TextEncoder().encode(META_NAME);
  const valBytes = new TextEncoder().encode(META_VAL);
  let offset = -1;
  outer: for (let i = 0; i <= buf.length - nameBytes.length; i++) {
    for (let j = 0; j < nameBytes.length; j++) {
      if (buf[i + j] !== nameBytes[j]) continue outer;
    }
    offset = i;
    break;
  }
  if (offset === -1) return false;
  if (offset + 8 * 4 + 4 > buf.length) return false;
  const view = new DataView(header);
  const valLen = view.getBigUint64(offset + 8 * 3, true);
  if (valLen !== /* @__PURE__ */ BigInt("4")) return false;
  for (let i = 0; i < valBytes.length; i++) {
    if (buf[offset + 8 * 4 + i] !== valBytes[i]) return false;
  }
  return true;
});
var absoluteUrl = (relativePath) => typeof document === "undefined" ? new URL(relativePath, self.location.href).href : new URL(relativePath, document.baseURI).href;
var padDigits = (number, digits) => {
  return Array(Math.max(digits - String(number).length + 1, 0)).join("0") + number;
};
var sumArr = (arr) => arr.reduce((prev, curr) => prev + curr, 0);
var isString = (value) => !!(value == null ? void 0 : value.startsWith);
var MMPROJ_FILE_NAME = "mmproj.gguf";
var prepareBlobs = (blobsInp) => __async(void 0, null, function* () {
  const blobs = [];
  let blobMmproj = null;
  for (const blob of blobsInp) {
    if (yield isMmproj(blob)) {
      blobMmproj = blob;
    } else {
      blobs.push(blob);
    }
  }
  sortFileByShard(blobs);
  const result = blobs.map((blob, i) => ({
    blob,
    name: `model-${padDigits(i + 1, 5)}-of-${padDigits(blobs.length, 5)}.gguf`
  }));
  if (blobMmproj) {
    result.push({
      blob: blobMmproj,
      name: MMPROJ_FILE_NAME
    });
  }
  return {
    llm: result.filter((f) => f.name !== MMPROJ_FILE_NAME),
    mmproj: blobMmproj ? { blob: blobMmproj, name: MMPROJ_FILE_NAME } : null,
    all: result
  };
});
var isSupportMultiThread = () => ((e) => __async(void 0, null, function* () {
  try {
    return "undefined" != typeof MessageChannel && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(e);
  } catch (e2) {
    return false;
  }
}))(
  new Uint8Array([
    0,
    97,
    115,
    109,
    1,
    0,
    0,
    0,
    1,
    4,
    1,
    96,
    0,
    0,
    3,
    2,
    1,
    0,
    5,
    4,
    1,
    3,
    1,
    1,
    10,
    11,
    1,
    9,
    0,
    65,
    0,
    254,
    16,
    2,
    0,
    26,
    11
  ])
);
var isSupportExceptions = () => __async(void 0, null, function* () {
  return WebAssembly.validate(
    new Uint8Array([
      0,
      97,
      115,
      109,
      1,
      0,
      0,
      0,
      1,
      4,
      1,
      96,
      0,
      0,
      3,
      2,
      1,
      0,
      10,
      8,
      1,
      6,
      0,
      6,
      64,
      25,
      11,
      11
    ])
  );
});
var isSupportSIMD = () => __async(void 0, null, function* () {
  return WebAssembly.validate(
    new Uint8Array([
      0,
      97,
      115,
      109,
      1,
      0,
      0,
      0,
      1,
      5,
      1,
      96,
      0,
      1,
      123,
      3,
      2,
      1,
      0,
      10,
      10,
      1,
      8,
      0,
      65,
      0,
      253,
      15,
      253,
      98,
      11
    ])
  );
});
var isSupportJSPI = () => {
  return !!WebAssembly.Suspending;
};
var isSupportWebGPU = () => {
  return !!navigator.gpu;
};
var isSupportMem64 = () => {
  try {
    new WebAssembly.Memory({
      address: "i64",
      initial: /* @__PURE__ */ BigInt("1")
      // 1 page (64 KiB)
    });
    return true;
  } catch (e) {
    return false;
  }
};
var checkEnvironmentCompatible = () => __async(void 0, null, function* () {
  if (!(yield isSupportExceptions())) {
    throw new Error("WebAssembly runtime does not support exception handling");
  }
  if (!(yield isSupportSIMD())) {
    throw new Error("WebAssembly runtime does not support SIMD");
  }
});
var isFirefox = () => {
  return !!navigator.userAgent.match(/Firefox\/([0-9\.]+)(?:\s|$)/);
};
var GGUF_FILE_REGEX = /^.*\.gguf(?:\?.*)?$/;
var isValidGgufFile = (path) => {
  return GGUF_FILE_REGEX.test(path);
};
var isSafariMobile = () => {
  return !!navigator.userAgent.match(/Version\/([0-9\._]+).*Mobile.*Safari.*/);
};
var createWorker = (workerCode) => {
  const workerURL = URL.createObjectURL(
    isString(workerCode) ? new Blob([workerCode], { type: "text/javascript" }) : workerCode
  );
  return new Worker(workerURL, { type: "module" });
};
var cbToAsyncIter = (fn) => (...args) => {
  let values = [];
  let resolve;
  let reject;
  values.push(
    new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    })
  );
  fn(...args, (val, done, err) => {
    if (err) {
      reject(err);
      return;
    }
    resolve([val, done]);
    values.push(
      new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      })
    );
  });
  return function() {
    return __asyncGenerator(this, null, function* () {
      let val;
      for (let i = 0, done = false; !done; i++) {
        [val, done] = yield new __await(values[i]);
        delete values[i];
        if (val !== void 0) yield val;
      }
    });
  }();
};
var canUseAsyncFileRead = (compat) => isSupportJSPI() || compat;
var needCompat = () => !isSupportJSPI() || !isSupportMem64();

// src/workers-code/generated.ts
var LIBLLAMA_VERSION = "b10781-c7bda03";
var LLAMA_CPP_WORKER_CODE = "// Start the main llama.cpp\nlet wllamaMalloc;\nlet wllamaStart;\nlet wllamaAction;\nlet wllamaExit;\nlet wllamaDebug;\n\nlet Module = null;\nlet isCompat = false;\nlet lastStack = '';\nlet isAborted = false;\nlet hasMultithread = false;\n\n//////////////////////////////////////////////////////////////\n// UTILS\n//////////////////////////////////////////////////////////////\n\n// send message back to main thread\nconst msg = (data, transfer) => postMessage(data, transfer);\n\n// Convert CPP log into JS log\nconst cppLogToJSLog = (line) => {\n  const matched = line.match(/@@(DEBUG|INFO|WARN|ERROR)@@(.*)/);\n  return !!matched\n    ? {\n        level: (matched[1] === 'INFO' ? 'debug' : matched[1]).toLowerCase(),\n        text: matched[2],\n      }\n    : { level: 'log', text: line };\n};\n\nconst getHeapU8 = () => {\n  const buffer = Module.wasmMemory.buffer;\n  return new Uint8Array(buffer);\n};\n\nconst toSizeT = (num) => {\n  return isCompat ? Number(num) : BigInt(num);\n};\n\n// Get module config that forwards stdout/err to main thread\nconst getWModuleConfig = (_argMainScriptBlob) => {\n  var pathConfig = RUN_OPTIONS.pathConfig;\n  var pthreadPoolSize = RUN_OPTIONS.nbThread;\n  var argMainScriptBlob = _argMainScriptBlob;\n\n  isCompat = RUN_OPTIONS.compat;\n  hasMultithread = pthreadPoolSize > 1;\n\n  msg({\n    verb: 'console.debug',\n    args: [\n      `Multithread enabled: ${hasMultithread}, pthreadPoolSize: ${pthreadPoolSize}`,\n    ],\n  });\n\n  if (!pathConfig['wllama.wasm']) {\n    throw new Error('\"wllama.wasm\" is missing in pathConfig');\n  }\n  return {\n    noInitialRun: true,\n    print: function (text) {\n      if (arguments.length > 1)\n        text = Array.prototype.slice.call(arguments).join(' ');\n      msg({ verb: 'console.log', args: [text] });\n    },\n    printErr: function (text) {\n      if (arguments.length > 1)\n        text = Array.prototype.slice.call(arguments).join(' ');\n      if (text.startsWith('@@STACK@@')) {\n        lastStack = text.slice('@@STACK@@'.length);\n        return;\n      }\n      const logLine = cppLogToJSLog(text);\n      msg({ verb: 'console.' + logLine.level, args: [logLine.text] });\n    },\n    locateFile: function (filename, basePath) {\n      const p = pathConfig[filename];\n      const truncate = (str) =>\n        str.length > 128 ? `${str.substr(0, 128)}...` : str;\n      if (filename.match(/wllama\\.worker\\.js/)) {\n        msg({\n          verb: 'console.error',\n          args: [\n            '\"wllama.worker.js\" is removed from v2.2.1. Hint: make sure to clear browser\\'s cache.',\n          ],\n        });\n      } else {\n        msg({\n          verb: 'console.debug',\n          args: [`Loading \"${filename}\" from \"${truncate(p)}\"`],\n        });\n        return p;\n      }\n    },\n    mainScriptUrlOrBlob: hasMultithread\n      ? argMainScriptBlob\n      : 'throw new Error(\"Multithreading is not enabled\")',\n    pthreadPoolSize: hasMultithread ? pthreadPoolSize : 0,\n    wasmMemory: hasMultithread ? getWasmMemory() : null,\n    onAbort: function (message) {\n      isAborted = true;\n      msg({ verb: 'signal.abort', args: ['abort', message, lastStack, null] });\n    },\n    onExit: function (code) {\n      isAborted = true;\n      const callstack = new Error().stack.toString();\n      msg({\n        verb: 'signal.abort',\n        args: ['abort', 'exit(' + code + ')', callstack, null],\n      });\n    },\n  };\n};\n\n// Get the memory to be used by wasm. (Only used in multi-thread mode)\n// Because we have a weird OOM issue on iOS, we need to try some values\n// See: https://github.com/emscripten-core/emscripten/issues/19144\n//      https://github.com/godotengine/godot/issues/70621\nconst getWasmMemory = () => {\n  let minBytes = 128 * 1024 * 1024;\n  // wasm32 stops at 4 GiB; memory64 can go further, the loop below steps down until the browser accepts it\n  let maxBytes = (isCompat ? 4096 : 8192) * 1024 * 1024;\n  let stepBytes = 128 * 1024 * 1024;\n  while (maxBytes > minBytes) {\n    try {\n      const wasmMemory = new WebAssembly.Memory({\n        initial: toSizeT(minBytes / 65536),\n        maximum: toSizeT(maxBytes / 65536),\n        shared: true,\n        address: isCompat ? undefined : 'i64',\n      });\n      return wasmMemory;\n    } catch (e) {\n      maxBytes -= stepBytes;\n      continue; // retry\n    }\n  }\n  throw new Error('Cannot allocate WebAssembly.Memory');\n};\n\n//////////////////////////////////////////////////////////////\n// HEAPFS PATCH\n//////////////////////////////////////////////////////////////\n\n/**\n * By default, emscripten uses memfs. The way it works is by\n * allocating new Uint8Array in javascript heap. This is not good\n * because it requires files to be copied to wasm heap each time\n * a file is read.\n *\n * HeapFS is an alternative, which resolves this problem by\n * allocating space for file directly inside wasm heap. This\n * allows us to mmap without doing any copy.\n *\n * For llama.cpp, this is great because we use MAP_SHARED\n *\n * Ref: https://github.com/ngxson/wllama/pull/39\n * Ref: https://github.com/emscripten-core/emscripten/blob/main/src/library_memfs.js\n *\n * Note 29/05/2024 @ngxson\n * Due to ftell() being limited to MAX_LONG, we cannot load files bigger than 2^31 bytes (or 2GB)\n * Ref: https://github.com/emscripten-core/emscripten/blob/main/system/lib/libc/musl/src/stdio/ftell.c\n */\n\nconst fsNameToFile = {}; // map Name => File\nconst fsIdToFile = {}; // map ID => File\nlet currFileId = 0;\n\n// Patch and redirect memfs calls to wllama\nconst patchHeapFS = () => {\n  const m = Module;\n  // save functions\n  m.MEMFS.stream_ops._read = m.MEMFS.stream_ops.read;\n  m.MEMFS.stream_ops._write = m.MEMFS.stream_ops.write;\n  m.MEMFS.stream_ops._llseek = m.MEMFS.stream_ops.llseek;\n  m.MEMFS.stream_ops._allocate = m.MEMFS.stream_ops.allocate;\n  m.MEMFS.stream_ops._mmap = m.MEMFS.stream_ops.mmap;\n  m.MEMFS.stream_ops._msync = m.MEMFS.stream_ops.msync;\n\n  const patchStream = (stream) => {\n    const name = stream.node.name;\n    if (fsNameToFile[name]) {\n      const f = fsNameToFile[name];\n      const ptr = Number(f.ptr);\n      stream.node.contents = getHeapU8().subarray(ptr, ptr + f.size);\n      stream.node.usedBytes = f.size;\n    }\n  };\n\n  // replace \"read\" functions\n  m.MEMFS.stream_ops.read = function (\n    stream,\n    buffer,\n    offset,\n    length,\n    position\n  ) {\n    patchStream(stream);\n    return m.MEMFS.stream_ops._read(stream, buffer, offset, length, position);\n  };\n  m.MEMFS.ops_table.file.stream.read = m.MEMFS.stream_ops.read;\n\n  // replace \"llseek\" functions\n  m.MEMFS.stream_ops.llseek = function (stream, offset, whence) {\n    patchStream(stream);\n    return m.MEMFS.stream_ops._llseek(stream, offset, whence);\n  };\n  m.MEMFS.ops_table.file.stream.llseek = m.MEMFS.stream_ops.llseek;\n\n  // replace \"mmap\" functions\n  m.MEMFS.stream_ops.mmap = function (stream, length, position, prot, flags) {\n    patchStream(stream);\n    const name = stream.node.name;\n    if (fsNameToFile[name]) {\n      const f = fsNameToFile[name];\n      const mmapPtr = f.ptr + toSizeT(position);\n      return {\n        ptr: mmapPtr,\n        allocated: false,\n      };\n    } else {\n      return m.MEMFS.stream_ops._mmap(stream, length, position, prot, flags);\n    }\n  };\n  m.MEMFS.ops_table.file.stream.mmap = m.MEMFS.stream_ops.mmap;\n\n  // mount FS\n  m.FS.mkdir('/models');\n  m.FS.mount(m.MEMFS, { root: '.' }, '/models');\n};\n\n// Allocate a new file in wllama heapfs, returns file ID\nconst heapfsAlloc = (name, size, allocBuffer) => {\n  if (size < 1) {\n    throw new Error('File size must be bigger than 0');\n  }\n  const m = Module;\n  const ptr = toSizeT(allocBuffer ? m.mmapAlloc(size) : 0);\n  const file = {\n    ptr: ptr,\n    size: size,\n    id: currFileId++,\n  };\n  fsIdToFile[file.id] = file;\n  fsNameToFile[name] = file;\n  return file.id;\n};\n\n// Add new file to wllama heapfs, return number of written bytes\nconst heapfsWrite = (id, buffer, offset) => {\n  if (fsIdToFile[id]) {\n    const { ptr, size } = fsIdToFile[id];\n    const afterWriteByte = offset + buffer.byteLength;\n    if (afterWriteByte > size) {\n      throw new Error(\n        `File ID ${id} write out of bound, afterWriteByte = ${afterWriteByte} while size = ${size}`\n      );\n    }\n    getHeapU8().set(buffer, Number(ptr) + offset);\n    return buffer.byteLength;\n  } else {\n    throw new Error(`File ID ${id} not found in heapfs`);\n  }\n};\n\n//////////////////////////////////////////////////////////////\n// ASYNC FILE READ\n//////////////////////////////////////////////////////////////\n\nlet isAwaitReading = false;\nlet pendingReadPromise = null;\nlet pendingReadResolve = null;\nlet pendingReadReject = null;\n\nconst _stripModelsPrefix = (path) => path.replace(/^\\/?models\\//, '');\n\n// Called from EM_ASYNC_JS stub in wllama-fs.h (path is already a JS string)\nconst _wllama_js_file_read = async (path, offset, req_size, out_ptr) => {\n  const name = _stripModelsPrefix(path);\n\n  pendingReadPromise = new Promise((res, rej) => {\n    pendingReadResolve = res;\n    pendingReadReject = rej;\n  });\n  isAwaitReading = true;\n\n  postMessage({ verb: 'fs.read_req', args: [name, offset, req_size] });\n\n  let data;\n  try {\n    data = await pendingReadPromise;\n  } finally {\n    isAwaitReading = false;\n    pendingReadResolve = null;\n    pendingReadReject = null;\n  }\n\n  const bytes = new Uint8Array(data);\n  getHeapU8().set(bytes, out_ptr);\n  return toSizeT(bytes.length);\n};\n\n//////////////////////////////////////////////////////////////\n// MAIN CODE\n//////////////////////////////////////////////////////////////\n\nconst callWrapper = (name, ret, args, isAsync) => {\n  const fn = Module.cwrap(\n    name,\n    ret,\n    args,\n    isAsync ? { async: true } : undefined\n  );\n  return async (action, req) => {\n    // console.log(`Calling ${name} with action:`, action, 'and req:', req);\n    let result;\n    try {\n      if (args.length === 2) {\n        result = isAsync ? await fn(action, req) : fn(action, req);\n      } else {\n        result = fn();\n      }\n    } catch (ex) {\n      console.error(ex);\n      throw ex;\n    }\n    return result;\n  };\n};\n\n// re-entering the wasm while a call is suspended (JSPI / asyncify) corrupts its state, so only one call runs at a time and the rest wait in the queue\nlet wasmCallBusy = false;\nconst wasmCallQueue = [];\n\nconst runWasmCall = async (callbackId, fn) => {\n  if (isAborted) {\n    // the wasm is dead, fail fast instead of calling into it\n    msg({ callbackId, err: 'wllama has crashed, please reload the module' });\n    return;\n  }\n  if (wasmCallBusy) {\n    wasmCallQueue.push({ callbackId, fn });\n    return;\n  }\n  wasmCallBusy = true;\n  try {\n    await fn();\n  } finally {\n    wasmCallBusy = false;\n    if (isAborted) {\n      // do not touch the wasm again after it aborted; the main thread already rejected the queued tasks\n      wasmCallQueue.length = 0;\n    } else {\n      const next = wasmCallQueue.shift();\n      if (next) runWasmCall(next.callbackId, next.fn);\n    }\n  }\n};\n\nconst runAction = async (data) => {\n  const { args, callbackId } = data;\n  const argAction = args[0];\n  const argEncodedMsg = args[1];\n  try {\n    const inputPtr = await wllamaMalloc(toSizeT(argEncodedMsg.byteLength), 0);\n    // copy data to wasm heap\n    const inputBuffer = new Uint8Array(\n      getHeapU8().buffer,\n      Number(inputPtr),\n      argEncodedMsg.byteLength\n    );\n    inputBuffer.set(argEncodedMsg, 0);\n    const outputPtr = await wllamaAction(argAction, inputPtr);\n    // length of output buffer is written at the first 4 bytes of input buffer\n    const outputLen = new Uint32Array(\n      getHeapU8().buffer,\n      Number(inputPtr),\n      1\n    )[0];\n    // copy the output buffer to JS heap\n    const outputBuffer = new Uint8Array(outputLen);\n    const outputSrcView = new Uint8Array(\n      getHeapU8().buffer,\n      Number(outputPtr),\n      outputLen\n    );\n    outputBuffer.set(outputSrcView, 0); // copy it\n    msg({ callbackId, result: outputBuffer }, [outputBuffer.buffer]);\n  } catch (err) {\n    handleError(err);\n  }\n};\n\nfunction handleError(err) {\n  // If WASM already aborted, onAbort already sent signal.abort; skip to avoid\n  // re-reporting the resulting WebAssembly.RuntimeError as a JS exception.\n  if (isAborted) return;\n\n  const message = err ? err.message || String(err) : 'Unknown error';\n  const stack = err ? err.stack || String(err) : '';\n  msg({\n    verb: 'signal.abort',\n    args: ['exception', message, stack, err],\n  });\n}\n\nonmessage = async (e) => {\n  if (!e.data) return;\n  const { verb, args, callbackId } = e.data;\n\n  // fs.read_res arrives while wasm is JSPI-suspended; resolve the pending promise.\n  if (verb === 'fs.read_res') {\n    if (pendingReadResolve) {\n      pendingReadResolve(args[0]);\n    }\n    return;\n  }\n\n  // Guard: while awaiting a file read, reject any other incoming task.\n  if (isAwaitReading) {\n    if (callbackId) {\n      msg({\n        callbackId,\n        err: 'Worker is suspended waiting for file data (JSPI)',\n      });\n    }\n    return;\n  }\n\n  if (!callbackId) {\n    msg({ verb: 'console.error', args: ['callbackId is required', e.data] });\n    return;\n  }\n\n  if (verb === 'module.init') {\n    const argMainScriptBlob = args[0];\n    const argUseAsyncFile = args[1];\n    try {\n      Module = getWModuleConfig(argMainScriptBlob);\n      Module.preRun = () => {\n        if (argUseAsyncFile) {\n          Module.ENV['USE_ASYNC_FILE'] = '1';\n        }\n      };\n      Module.onRuntimeInitialized = () => {\n        // async call once module is ready\n        // init FS\n        patchHeapFS();\n        // init cwrap\n        const pointer = isCompat ? 'number' : 'bigint';\n        // TODO: note sure why emscripten cannot bind if there is only 1 argument\n        wllamaMalloc = callWrapper('wllama_malloc', pointer, [\n          'number',\n          pointer,\n        ]);\n        wllamaStart = callWrapper('wllama_start', 'string', [], true);\n        wllamaAction = callWrapper(\n          'wllama_action',\n          pointer,\n          ['string', pointer],\n          true\n        );\n        wllamaExit = callWrapper('wllama_exit', 'string', []);\n        wllamaDebug = callWrapper('wllama_debug', 'string', []);\n        msg({ callbackId, result: null });\n      };\n      wModuleInit();\n    } catch (err) {\n      handleError(err);\n    }\n    return;\n  }\n\n  if (verb === 'fs.alloc') {\n    const argFilename = args[0];\n    const argSize = args[1];\n    const argAllocBuffer = args[2];\n    try {\n      // create blank file\n      const emptyBuffer = new ArrayBuffer(0);\n      Module['FS_createDataFile'](\n        '/models',\n        argFilename,\n        emptyBuffer,\n        true,\n        true,\n        true\n      );\n      // alloc data on heap\n      const fileId = heapfsAlloc(argFilename, argSize, argAllocBuffer);\n      msg({ callbackId, result: { fileId } });\n    } catch (err) {\n      handleError(err);\n    }\n    return;\n  }\n\n  if (verb === 'fs.write') {\n    const argFileId = args[0];\n    const argBuffer = args[1];\n    const argOffset = args[2];\n    try {\n      const writtenBytes = heapfsWrite(argFileId, argBuffer, argOffset);\n      msg({ callbackId, result: { writtenBytes } });\n    } catch (err) {\n      handleError(err);\n    }\n    return;\n  }\n\n  if (verb === 'wllama.start') {\n    await runWasmCall(callbackId, async () => {\n      try {\n        const result = await wllamaStart();\n        msg({ callbackId, result });\n      } catch (err) {\n        handleError(err);\n      }\n    });\n    return;\n  }\n\n  if (verb === 'wllama.action') {\n    await runWasmCall(callbackId, () => runAction(e.data));\n    return;\n  }\n\n  if (verb === 'wllama.exit') {\n    await runWasmCall(callbackId, async () => {\n      try {\n        const result = await wllamaExit();\n        msg({ callbackId, result });\n      } catch (err) {\n        handleError(err);\n      }\n    });\n    return;\n  }\n\n  if (verb === 'wllama.debug') {\n    await runWasmCall(callbackId, async () => {\n      try {\n        const result = await wllamaDebug();\n        msg({ callbackId, result });\n      } catch (err) {\n        handleError(err);\n      }\n    });\n    return;\n  }\n};\n";
var OPFS_UTILS_WORKER_CODE = "let accessHandle;\nlet abortController = new AbortController();\n\nasync function openFile(filename) {\n  const opfsRoot = await navigator.storage.getDirectory();\n  const cacheDir = await opfsRoot.getDirectoryHandle('cache', { create: true });\n  const fileHandler = await cacheDir.getFileHandle(filename, { create: true });\n  accessHandle = await fileHandler.createSyncAccessHandle();\n  accessHandle.truncate(0); // clear file content\n}\n\nasync function writeFile(buf) {\n  accessHandle.write(buf);\n}\n\nasync function closeFile() {\n  accessHandle.flush();\n  accessHandle.close();\n}\n\nasync function writeTextFile(filename, str) {\n  await openFile(filename);\n  await writeFile(new TextEncoder().encode(str));\n  await closeFile();\n}\n\nconst throttled = (func, delay) => {\n  let lastRun = 0;\n  return (...args) => {\n    const now = Date.now();\n    if (now - lastRun > delay) {\n      lastRun = now;\n      func.apply(null, args);\n    }\n  };\n};\n\nconst assertNonNull = (val) => {\n  if (val === null || val === undefined) {\n    throw new Error('OPFS Worker: Assertion failed');\n  }\n};\n\n// respond to main thread\nconst resOK = () => postMessage({ ok: true });\nconst resProgress = (loaded, total) =>\n  postMessage({ progress: { loaded, total } });\nconst resErr = (err) => postMessage({ err });\n\nonmessage = async (e) => {\n  try {\n    if (!e.data) return;\n\n    /**\n     * @param {Object} e.data\n     *\n     * Fine-control FS actions:\n     * - { action: 'open', filename: 'string' }\n     * - { action: 'write', buf: ArrayBuffer }\n     * - { action: 'close' }\n     *\n     * Simple write API:\n     * - { action: 'write-simple', filename: 'string', buf: ArrayBuffer }\n     *\n     * Download API:\n     * - { action: 'download', url: 'string', filename: 'string', options: Object, metadataFileName: 'string' }\n     * - { action: 'download-abort' }\n     */\n    const {\n      action,\n      filename,\n      buf,\n      url,\n      options,\n      metadataFileName,\n      metadataAdditional,\n    } = e.data;\n\n    if (action === 'open') {\n      assertNonNull(filename);\n      await openFile(filename);\n      return resOK();\n    } else if (action === 'write') {\n      assertNonNull(buf);\n      await writeFile(buf);\n      return resOK();\n    } else if (action === 'close') {\n      await closeFile();\n      return resOK();\n    } else if (action === 'write-simple') {\n      assertNonNull(filename);\n      assertNonNull(buf);\n      await openFile(filename);\n      await writeFile(buf);\n      await closeFile();\n      return resOK();\n    } else if (action === 'download') {\n      assertNonNull(url);\n      assertNonNull(filename);\n      assertNonNull(metadataFileName);\n      assertNonNull(options);\n      assertNonNull(options.aborted);\n      abortController = new AbortController();\n      if (options.aborted) abortController.abort();\n      const response = await fetch(url, {\n        ...options,\n        signal: abortController.signal,\n      });\n      const contentLength = response.headers.get('content-length');\n      const etag = (response.headers.get('etag') || '').replace(\n        /[^A-Za-z0-9]/g,\n        ''\n      );\n      const total = parseInt(contentLength, 10);\n      const reader = response.body.getReader();\n      await openFile(filename);\n      let loaded = 0;\n      const throttledProgress = throttled(resProgress, 100);\n      while (true) {\n        const { done, value } = await reader.read();\n        if (done) break;\n        loaded += value.byteLength;\n        await writeFile(value);\n        throttledProgress(loaded, total);\n      }\n      resProgress(total, total); // 100% done\n      await closeFile();\n      // make sure this is in-sync with CacheEntryMetadata\n      await writeTextFile(\n        metadataFileName,\n        JSON.stringify({\n          originalURL: url,\n          originalSize: total,\n          etag,\n          ...metadataAdditional,\n        })\n      );\n      return resOK();\n    } else if (action === 'download-abort') {\n      if (abortController) {\n        abortController.abort();\n      }\n      return;\n    }\n\n    throw new Error('OPFS Worker: Invalid action', e.data);\n  } catch (err) {\n    return resErr(err);\n  }\n};\n";
var WLLAMA_EMSCRIPTEN_CODE = 'var Module=typeof Module!="undefined"?Module:{};var ENVIRONMENT_IS_WEB=!!globalThis.window;var ENVIRONMENT_IS_WORKER=!!globalThis.WorkerGlobalScope;var ENVIRONMENT_IS_NODE=globalThis.process?.versions?.node&&globalThis.process?.type!="renderer";var ENVIRONMENT_IS_PTHREAD=ENVIRONMENT_IS_WORKER&&self.name?.startsWith("em-pthread");if(ENVIRONMENT_IS_NODE){var worker_threads=require("worker_threads");global.Worker=worker_threads.Worker;ENVIRONMENT_IS_WORKER=!worker_threads.isMainThread;ENVIRONMENT_IS_PTHREAD=ENVIRONMENT_IS_WORKER&&worker_threads["workerData"]=="em-pthread"}var arguments_=[];var thisProgram="./this.program";var quit_=(status,toThrow)=>{throw toThrow};var _scriptName=globalThis.document?.currentScript?.src;if(typeof __filename!="undefined"){_scriptName=__filename}else if(ENVIRONMENT_IS_WORKER){_scriptName=self.location.href}var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var readAsync,readBinary;if(ENVIRONMENT_IS_NODE){var fs=require("fs");scriptDirectory=__dirname+"/";readBinary=filename=>{filename=isFileURI(filename)?new URL(filename):filename;var ret=fs.readFileSync(filename);return ret};readAsync=async(filename,binary=true)=>{filename=isFileURI(filename)?new URL(filename):filename;var ret=fs.readFileSync(filename,binary?undefined:"utf8");return ret};if(process.argv.length>1){thisProgram=process.argv[1].replace(/\\\\/g,"/")}arguments_=process.argv.slice(2);if(typeof module!="undefined"){module["exports"]=Module}quit_=(status,toThrow)=>{process.exitCode=status;throw toThrow}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){try{scriptDirectory=new URL(".",_scriptName).href}catch{}if(!ENVIRONMENT_IS_NODE){if(ENVIRONMENT_IS_WORKER){readBinary=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}readAsync=async url=>{if(isFileURI(url)){return new Promise((resolve,reject)=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=()=>{if(xhr.status==200||xhr.status==0&&xhr.response){resolve(xhr.response);return}reject(xhr.status)};xhr.onerror=reject;xhr.send(null)})}var response=await fetch(url,{credentials:"same-origin"});if(response.ok){return response.arrayBuffer()}throw new Error(response.status+" : "+response.url)}}}else{}var defaultPrint=console.log.bind(console);var defaultPrintErr=console.error.bind(console);if(ENVIRONMENT_IS_NODE){var utils=require("util");var stringify=a=>typeof a=="object"?utils.inspect(a):a;defaultPrint=(...args)=>fs.writeSync(1,args.map(stringify).join(" ")+"\\n");defaultPrintErr=(...args)=>fs.writeSync(2,args.map(stringify).join(" ")+"\\n")}var out=defaultPrint;var err=defaultPrintErr;var wasmBinary;var wasmModule;var ABORT=false;var EXITSTATUS;function assert(condition,text){if(!condition){abort(text)}}var isFileURI=filename=>filename.startsWith("file://");function growMemViews(){if(wasmMemory.buffer!=HEAP8.buffer){updateMemoryViews()}}if(ENVIRONMENT_IS_NODE&&ENVIRONMENT_IS_PTHREAD){var parentPort=worker_threads["parentPort"];parentPort.on("message",msg=>global.onmessage?.({data:msg}));Object.assign(globalThis,{self:global,postMessage:msg=>parentPort["postMessage"](msg)});process.on("uncaughtException",err=>{postMessage({cmd:"uncaughtException",error:err});process.exit(1)})}var startWorker;if(ENVIRONMENT_IS_PTHREAD){var initializedJS=false;self.onunhandledrejection=e=>{throw e.reason||e};async function handleMessage(e){try{var msgData=e["data"];var cmd=msgData.cmd;if(cmd==="load"){let messageQueue=[];self.onmessage=e=>messageQueue.push(e);startWorker=()=>{postMessage({cmd:"loaded"});for(let msg of messageQueue){handleMessage(msg)}self.onmessage=handleMessage};for(const handler of msgData.handlers){if(!Module[handler]||Module[handler].proxy){Module[handler]=(...args)=>{postMessage({cmd:"callHandler",handler,args})};if(handler=="print")out=Module[handler];if(handler=="printErr")err=Module[handler]}}wasmMemory=msgData.wasmMemory;updateMemoryViews();wasmModule=msgData.wasmModule;createWasm();run()}else if(cmd==="run"){establishStackSpace(msgData.pthread_ptr);__emscripten_thread_init(msgData.pthread_ptr,0,0,1,0,0);PThread.threadInitTLS();__emscripten_thread_mailbox_await(msgData.pthread_ptr);if(!initializedJS){initializedJS=true}try{await invokeEntryPoint(msgData.start_routine,msgData.arg)}catch(ex){if(ex!="unwind"){throw ex}}}else if(msgData.target==="setimmediate"){}else if(cmd==="checkMailbox"){if(initializedJS){checkMailbox()}}else if(cmd){err(`worker: received unknown command ${cmd}`);err(msgData)}}catch(ex){__emscripten_thread_crashed();throw ex}}self.onmessage=handleMessage}var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;var HEAP64,HEAPU64;var runtimeInitialized=false;function updateMemoryViews(){var b=wasmMemory.buffer;HEAP8=new Int8Array(b);HEAP16=new Int16Array(b);Module["HEAPU8"]=HEAPU8=new Uint8Array(b);HEAPU16=new Uint16Array(b);HEAP32=new Int32Array(b);HEAPU32=new Uint32Array(b);HEAPF32=new Float32Array(b);HEAPF64=new Float64Array(b);HEAP64=new BigInt64Array(b);HEAPU64=new BigUint64Array(b)}function initMemory(){if(ENVIRONMENT_IS_PTHREAD){return}if(Module["wasmMemory"]){wasmMemory=Module["wasmMemory"]}else{var INITIAL_MEMORY=Module["INITIAL_MEMORY"]||134217728;wasmMemory=new WebAssembly.Memory({initial:BigInt(INITIAL_MEMORY/65536),maximum:262144n,shared:true,address:"i64"})}updateMemoryViews()}function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(onPreRuns)}function initRuntime(){runtimeInitialized=true;if(ENVIRONMENT_IS_PTHREAD)return startWorker();if(!Module["noFSInit"]&&!FS.initialized)FS.init();TTY.init();wasmExports["__wasm_call_ctors"]();FS.ignorePermissions=false}function preMain(){}function postRun(){if(ENVIRONMENT_IS_PTHREAD){return}if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(onPostRuns)}function abort(what){Module["onAbort"]?.(what);what="Aborted("+what+")";err(what);ABORT=true;what+=". Build with -sASSERTIONS for more info.";if(runtimeInitialized){___trap()}var e=new WebAssembly.RuntimeError(what);throw e}var wasmBinaryFile;function findWasmBinary(){return locateFile("wllama.wasm")}function getBinarySync(file){if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}throw"both async and sync fetching of the wasm failed"}async function getWasmBinary(binaryFile){if(!wasmBinary){try{var response=await readAsync(binaryFile);return new Uint8Array(response)}catch{}}return getBinarySync(binaryFile)}async function instantiateArrayBuffer(binaryFile,imports){try{var binary=await getWasmBinary(binaryFile);var instance=await WebAssembly.instantiate(binary,imports);return instance}catch(reason){err(`failed to asynchronously prepare wasm: ${reason}`);abort(reason)}}async function instantiateAsync(binary,binaryFile,imports){if(!binary&&!isFileURI(binaryFile)&&!ENVIRONMENT_IS_NODE){try{var response=fetch(binaryFile,{credentials:"same-origin"});var instantiationResult=await WebAssembly.instantiateStreaming(response,imports);return instantiationResult}catch(reason){err(`wasm streaming compile failed: ${reason}`);err("falling back to ArrayBuffer instantiation")}}return instantiateArrayBuffer(binaryFile,imports)}function getWasmImports(){assignWasmImports();if(!wasmImports.__instrumented){wasmImports.__instrumented=true;Asyncify.instrumentWasmImports(wasmImports)}var imports={env:wasmImports,wasi_snapshot_preview1:wasmImports};return imports}async function createWasm(){function receiveInstance(instance,module){wasmExports=instance.exports;wasmExports=Asyncify.instrumentWasmExports(wasmExports);wasmExports=applySignatureConversions(wasmExports);registerTLSInit(wasmExports["_emscripten_tls_init"]);assignWasmExports(wasmExports);wasmModule=module;removeRunDependency("wasm-instantiate");return wasmExports}addRunDependency("wasm-instantiate");function receiveInstantiationResult(result){return receiveInstance(result["instance"],result["module"])}var info=getWasmImports();if(Module["instantiateWasm"]){return new Promise((resolve,reject)=>{Module["instantiateWasm"](info,(inst,mod)=>{resolve(receiveInstance(inst,mod))})})}if(ENVIRONMENT_IS_PTHREAD){var instance=new WebAssembly.Instance(wasmModule,getWasmImports());return receiveInstance(instance,wasmModule)}wasmBinaryFile??=findWasmBinary();var result=await instantiateAsync(wasmBinary,wasmBinaryFile,info);var exports=receiveInstantiationResult(result);return exports}class ExitStatus{name="ExitStatus";constructor(status){this.message=`Program terminated with exit(${status})`;this.status=status}}var terminateWorker=worker=>{worker.terminate();worker.onmessage=e=>{}};var cleanupThread=pthread_ptr=>{var worker=PThread.pthreads[pthread_ptr];PThread.returnWorkerToPool(worker)};var callRuntimeCallbacks=callbacks=>{while(callbacks.length>0){callbacks.shift()(Module)}};var onPreRuns=[];var addOnPreRun=cb=>onPreRuns.push(cb);var runDependencies=0;var dependenciesFulfilled=null;var removeRunDependency=id=>{runDependencies--;Module["monitorRunDependencies"]?.(runDependencies);if(runDependencies==0){if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}};var addRunDependency=id=>{runDependencies++;Module["monitorRunDependencies"]?.(runDependencies)};var spawnThread=threadParams=>{var worker=PThread.getNewWorker();if(!worker){return 6}PThread.runningWorkers.push(worker);PThread.pthreads[threadParams.pthread_ptr]=worker;worker.pthread_ptr=threadParams.pthread_ptr;var msg={cmd:"run",start_routine:threadParams.startRoutine,arg:threadParams.arg,pthread_ptr:threadParams.pthread_ptr};if(ENVIRONMENT_IS_NODE){worker.unref()}worker.postMessage(msg,threadParams.transferList);return 0};var runtimeKeepaliveCounter=0;var keepRuntimeAlive=()=>noExitRuntime||runtimeKeepaliveCounter>0;var stackSave=()=>_emscripten_stack_get_current();var stackRestore=val=>__emscripten_stack_restore(val);var stackAlloc=sz=>__emscripten_stack_alloc(sz);var proxyToMainThread=(funcIndex,emAsmAddr,sync,...callArgs)=>{var serializedNumCallArgs=callArgs.length*2;var sp=stackSave();var args=stackAlloc(serializedNumCallArgs*8);var b=args/8;for(var i=0;i<callArgs.length;i++){var arg=callArgs[i];if(typeof arg=="bigint"){(growMemViews(),HEAP64)[b+2*i]=1n;(growMemViews(),HEAP64)[b+2*i+1]=arg}else{(growMemViews(),HEAP64)[b+2*i]=0n;(growMemViews(),HEAPF64)[b+2*i+1]=arg}}var rtn=__emscripten_run_js_on_main_thread(funcIndex,emAsmAddr,serializedNumCallArgs,args,sync);stackRestore(sp);return rtn};function _proc_exit(code){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(0,0,1,code);EXITSTATUS=code;if(!keepRuntimeAlive()){PThread.terminateAllThreads();Module["onExit"]?.(code);ABORT=true}quit_(code,new ExitStatus(code))}function exitOnMainThread(returnCode){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(1,0,0,returnCode);_exit(returnCode)}var exitJS=(status,implicit)=>{EXITSTATUS=status;if(ENVIRONMENT_IS_PTHREAD){exitOnMainThread(status);throw"unwind"}_proc_exit(status)};var _exit=exitJS;var PThread={unusedWorkers:[],runningWorkers:[],tlsInitFunctions:[],pthreads:{},init(){if(!ENVIRONMENT_IS_PTHREAD){PThread.initMainThread()}},initMainThread(){var pthreadPoolSize=Module["pthreadPoolSize"];while(pthreadPoolSize--){PThread.allocateUnusedWorker()}addOnPreRun(async()=>{var pthreadPoolReady=PThread.loadWasmModuleToAllWorkers();addRunDependency("loading-workers");await pthreadPoolReady;removeRunDependency("loading-workers")})},terminateAllThreads:()=>{for(var worker of PThread.runningWorkers){terminateWorker(worker)}for(var worker of PThread.unusedWorkers){terminateWorker(worker)}PThread.unusedWorkers=[];PThread.runningWorkers=[];PThread.pthreads={}},returnWorkerToPool:worker=>{var pthread_ptr=worker.pthread_ptr;delete PThread.pthreads[pthread_ptr];PThread.unusedWorkers.push(worker);PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker),1);worker.pthread_ptr=0;__emscripten_thread_free_data(pthread_ptr)},threadInitTLS(){PThread.tlsInitFunctions.forEach(f=>f())},loadWasmModuleToWorker:worker=>new Promise(onFinishedLoading=>{worker.onmessage=e=>{var d=e["data"];var cmd=d.cmd;if(d.targetThread&&d.targetThread!=_pthread_self()){var targetWorker=PThread.pthreads[d.targetThread];if(targetWorker){targetWorker.postMessage(d,d.transferList)}else{err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d.targetThread}, but that thread no longer exists!`)}return}if(cmd==="checkMailbox"){checkMailbox()}else if(cmd==="spawnThread"){spawnThread(d)}else if(cmd==="cleanupThread"){callUserCallback(()=>cleanupThread(d.thread))}else if(cmd==="loaded"){worker.loaded=true;if(ENVIRONMENT_IS_NODE&&!worker.pthread_ptr){worker.unref()}onFinishedLoading(worker)}else if(d.target==="setimmediate"){worker.postMessage(d)}else if(cmd==="uncaughtException"){worker.onerror(d.error)}else if(cmd==="callHandler"){Module[d.handler](...d.args)}else if(cmd){err(`worker sent an unknown command ${cmd}`)}};worker.onerror=e=>{var message="worker sent an error!";err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);throw e};if(ENVIRONMENT_IS_NODE){worker.on("message",data=>worker.onmessage({data}));worker.on("error",e=>worker.onerror(e))}var handlers=[];var knownHandlers=["onExit","onAbort","print","printErr"];for(var handler of knownHandlers){if(Module.propertyIsEnumerable(handler)){handlers.push(handler)}}worker.postMessage({cmd:"load",handlers,wasmMemory,wasmModule})}),async loadWasmModuleToAllWorkers(){if(ENVIRONMENT_IS_PTHREAD){return}let pthreadPoolReady=Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));return pthreadPoolReady},allocateUnusedWorker(){var worker;var pthreadMainJs=_scriptName;if(Module["mainScriptUrlOrBlob"]){pthreadMainJs=Module["mainScriptUrlOrBlob"];if(typeof pthreadMainJs!="string"){pthreadMainJs=URL.createObjectURL(pthreadMainJs)}}worker=new Worker(pthreadMainJs,{workerData:"em-pthread",name:"em-pthread"});PThread.unusedWorkers.push(worker)},getNewWorker(){if(PThread.unusedWorkers.length==0){PThread.allocateUnusedWorker();PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0])}return PThread.unusedWorkers.pop()}};var onPostRuns=[];var addOnPostRun=cb=>onPostRuns.push(cb);function establishStackSpace(pthread_ptr){var stackHigh=Number((growMemViews(),HEAPU64)[(pthread_ptr+88)/8]);var stackSize=Number((growMemViews(),HEAPU64)[(pthread_ptr+96)/8]);var stackLow=stackHigh-stackSize;_emscripten_stack_set_limits(stackHigh,stackLow);stackRestore(stackHigh)}var wasmTableMirror=[];var getWasmTableEntry=funcPtr=>{funcPtr=Number(funcPtr);var func=wasmTableMirror[funcPtr];if(!func){wasmTableMirror[funcPtr]=func=wasmTable.get(BigInt(funcPtr));if(Asyncify.isAsyncExport(func)){wasmTableMirror[funcPtr]=func=Asyncify.makeAsyncFunction(func)}}return func};var invokeEntryPoint=async(ptr,arg)=>{runtimeKeepaliveCounter=0;noExitRuntime=0;var result=(a1=>WebAssembly.promising(getWasmTableEntry(ptr)).call(null,BigInt(a1)))(arg);function finish(result){if(keepRuntimeAlive()){EXITSTATUS=result;return}__emscripten_thread_exit(result)}result=await result;finish(result)};invokeEntryPoint.isAsync=true;var noExitRuntime=true;var registerTLSInit=tlsInitFunc=>PThread.tlsInitFunctions.push(tlsInitFunc);var wasmMemory;function pthreadCreateProxied(pthread_ptr,attr,startRoutine,arg){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(2,0,1,pthread_ptr,attr,startRoutine,arg);return ___pthread_create_js(pthread_ptr,attr,startRoutine,arg)}var _emscripten_has_threading_support=()=>!!globalThis.SharedArrayBuffer;var INT53_MAX=9007199254740992;var INT53_MIN=-9007199254740992;var bigintToI53Checked=num=>num<INT53_MIN||num>INT53_MAX?NaN:Number(num);function ___pthread_create_js(pthread_ptr,attr,startRoutine,arg){pthread_ptr=bigintToI53Checked(pthread_ptr);attr=bigintToI53Checked(attr);startRoutine=bigintToI53Checked(startRoutine);arg=bigintToI53Checked(arg);if(!_emscripten_has_threading_support()){return 6}var transferList=[];var error=0;if(ENVIRONMENT_IS_PTHREAD&&(transferList.length===0||error)){return pthreadCreateProxied(pthread_ptr,attr,startRoutine,arg)}if(error)return error;var threadParams={startRoutine,pthread_ptr,arg,transferList};if(ENVIRONMENT_IS_PTHREAD){threadParams.cmd="spawnThread";postMessage(threadParams,transferList);return 0}return spawnThread(threadParams)}var syscallGetVarargP=()=>{var ret=Number((growMemViews(),HEAPU64)[SYSCALLS.varargs/8]);SYSCALLS.varargs+=8;return ret};var syscallGetVarargI=()=>{var ret=(growMemViews(),HEAP32)[+SYSCALLS.varargs/4];SYSCALLS.varargs+=4;return ret};var PATH={isAbs:path=>path.charAt(0)==="/",splitPath:filename=>{var splitPathRe=/^(\\/?|)([\\s\\S]*?)((?:\\.{1,2}|[^\\/]+?|)(\\.[^.\\/]*|))(?:[\\/]*)$/;return splitPathRe.exec(filename).slice(1)},normalizeArray:(parts,allowAboveRoot)=>{var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1)}else if(last===".."){parts.splice(i,1);up++}else if(up){parts.splice(i,1);up--}}if(allowAboveRoot){for(;up;up--){parts.unshift("..")}}return parts},normalize:path=>{var isAbsolute=PATH.isAbs(path),trailingSlash=path.slice(-1)==="/";path=PATH.normalizeArray(path.split("/").filter(p=>!!p),!isAbsolute).join("/");if(!path&&!isAbsolute){path="."}if(path&&trailingSlash){path+="/"}return(isAbsolute?"/":"")+path},dirname:path=>{var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return"."}if(dir){dir=dir.slice(0,-1)}return root+dir},basename:path=>path&&path.match(/([^\\/]+|\\/)\\/*$/)[1],join:(...paths)=>PATH.normalize(paths.join("/")),join2:(l,r)=>PATH.normalize(l+"/"+r)};var initRandomFill=()=>view=>view.set(crypto.getRandomValues(new Uint8Array(view.byteLength)));var randomFill=view=>{(randomFill=initRandomFill())(view)};var PATH_FS={resolve:(...args)=>{var resolvedPath="",resolvedAbsolute=false;for(var i=args.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?args[i]:FS.cwd();if(typeof path!="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){return""}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=PATH.isAbs(path)}resolvedPath=PATH.normalizeArray(resolvedPath.split("/").filter(p=>!!p),!resolvedAbsolute).join("/");return(resolvedAbsolute?"/":"")+resolvedPath||"."},relative:(from,to)=>{from=PATH_FS.resolve(from).slice(1);to=PATH_FS.resolve(to).slice(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return[];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..")}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")}};var UTF8Decoder=globalThis.TextDecoder&&new TextDecoder;var findStringEnd=(heapOrArray,idx,maxBytesToRead,ignoreNul)=>{var maxIdx=idx+maxBytesToRead;if(ignoreNul)return maxIdx;while(heapOrArray[idx]&&!(idx>=maxIdx))++idx;return idx};var UTF8ArrayToString=(heapOrArray,idx=0,maxBytesToRead,ignoreNul)=>{var endPtr=findStringEnd(heapOrArray,idx,maxBytesToRead,ignoreNul);if(endPtr-idx>16&&heapOrArray.buffer&&UTF8Decoder){return UTF8Decoder.decode(heapOrArray.buffer instanceof ArrayBuffer?heapOrArray.subarray(idx,endPtr):heapOrArray.slice(idx,endPtr))}var str="";while(idx<endPtr){var u0=heapOrArray[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heapOrArray[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heapOrArray[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u0=(u0&7)<<18|u1<<12|u2<<6|heapOrArray[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}return str};var FS_stdin_getChar_buffer=[];var lengthBytesUTF8=str=>{var len=0;for(var i=0;i<str.length;++i){var c=str.charCodeAt(i);if(c<=127){len++}else if(c<=2047){len+=2}else if(c>=55296&&c<=57343){len+=4;++i}else{len+=3}}return len};var stringToUTF8Array=(str,heap,outIdx,maxBytesToWrite)=>{if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.codePointAt(i);if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++]=192|u>>6;heap[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++]=224|u>>12;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;heap[outIdx++]=240|u>>18;heap[outIdx++]=128|u>>12&63;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63;i++}}heap[outIdx]=0;return outIdx-startIdx};var intArrayFromString=(stringy,dontAddNull,length)=>{var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array};var FS_stdin_getChar=()=>{if(!FS_stdin_getChar_buffer.length){var result=null;if(ENVIRONMENT_IS_NODE){var BUFSIZE=256;var buf=Buffer.alloc(BUFSIZE);var bytesRead=0;var fd=process.stdin.fd;try{bytesRead=fs.readSync(fd,buf,0,BUFSIZE)}catch(e){if(e.toString().includes("EOF"))bytesRead=0;else throw e}if(bytesRead>0){result=buf.slice(0,bytesRead).toString("utf-8")}}else if(globalThis.window?.prompt){result=window.prompt("Input: ");if(result!==null){result+="\\n"}}else{}if(!result){return null}FS_stdin_getChar_buffer=intArrayFromString(result,true)}return FS_stdin_getChar_buffer.shift()};var TTY={ttys:[],init(){},shutdown(){},register(dev,ops){TTY.ttys[dev]={input:[],output:[],ops};FS.registerDevice(dev,TTY.stream_ops)},stream_ops:{open(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(43)}stream.tty=tty;stream.seekable=false},close(stream){stream.tty.ops.fsync(stream.tty)},fsync(stream){stream.tty.ops.fsync(stream.tty)},read(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(60)}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty)}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.atime=Date.now()}return bytesRead},write(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(60)}try{for(var i=0;i<length;i++){stream.tty.ops.put_char(stream.tty,buffer[offset+i])}}catch(e){throw new FS.ErrnoError(29)}if(length){stream.node.mtime=stream.node.ctime=Date.now()}return i}},default_tty_ops:{get_char(tty){return FS_stdin_getChar()},put_char(tty,val){if(val===null||val===10){out(UTF8ArrayToString(tty.output));tty.output=[]}else{if(val!=0)tty.output.push(val)}},fsync(tty){if(tty.output?.length>0){out(UTF8ArrayToString(tty.output));tty.output=[]}},ioctl_tcgets(tty){return{c_iflag:25856,c_oflag:5,c_cflag:191,c_lflag:35387,c_cc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},ioctl_tcsets(tty,optional_actions,data){return 0},ioctl_tiocgwinsz(tty){return[24,80]}},default_tty1_ops:{put_char(tty,val){if(val===null||val===10){err(UTF8ArrayToString(tty.output));tty.output=[]}else{if(val!=0)tty.output.push(val)}},fsync(tty){if(tty.output?.length>0){err(UTF8ArrayToString(tty.output));tty.output=[]}}}};var zeroMemory=(ptr,size)=>(growMemViews(),HEAPU8).fill(0,ptr,ptr+size);var alignMemory=(size,alignment)=>Math.ceil(size/alignment)*alignment;var mmapAlloc=size=>{size=alignMemory(size,65536);var ptr=_emscripten_builtin_memalign(65536,size);if(ptr)zeroMemory(ptr,size);return ptr};var MEMFS={ops_table:null,mount(mount){return MEMFS.createNode(null,"/",16895,0)},createNode(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){throw new FS.ErrnoError(63)}MEMFS.ops_table||={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,mmap:MEMFS.stream_ops.mmap,msync:MEMFS.stream_ops.msync}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}};var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={}}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;node.contents=null}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream}node.atime=node.mtime=node.ctime=Date.now();if(parent){parent.contents[name]=node;parent.atime=parent.mtime=parent.ctime=node.atime}return node},getFileDataAsTypedArray(node){if(!node.contents)return new Uint8Array(0);if(node.contents.subarray)return node.contents.subarray(0,node.usedBytes);return new Uint8Array(node.contents)},expandFileStorage(node,newCapacity){var prevCapacity=node.contents?node.contents.length:0;if(prevCapacity>=newCapacity)return;var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2:1.125)>>>0);if(prevCapacity!=0)newCapacity=Math.max(newCapacity,256);var oldContents=node.contents;node.contents=new Uint8Array(newCapacity);if(node.usedBytes>0)node.contents.set(oldContents.subarray(0,node.usedBytes),0)},resizeFileStorage(node,newSize){if(node.usedBytes==newSize)return;if(newSize==0){node.contents=null;node.usedBytes=0}else{var oldContents=node.contents;node.contents=new Uint8Array(newSize);if(oldContents){node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)))}node.usedBytes=newSize}},node_ops:{getattr(node){var attr={};attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096}else if(FS.isFile(node.mode)){attr.size=node.usedBytes}else if(FS.isLink(node.mode)){attr.size=node.link.length}else{attr.size=0}attr.atime=new Date(node.atime);attr.mtime=new Date(node.mtime);attr.ctime=new Date(node.ctime);attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr},setattr(node,attr){for(const key of["mode","atime","mtime","ctime"]){if(attr[key]!=null){node[key]=attr[key]}}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size)}},lookup(parent,name){if(!MEMFS.doesNotExistError){MEMFS.doesNotExistError=new FS.ErrnoError(44);MEMFS.doesNotExistError.stack="<generic error, no stack>"}throw MEMFS.doesNotExistError},mknod(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev)},rename(old_node,new_dir,new_name){var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(new_node){if(FS.isDir(old_node.mode)){for(var i in new_node.contents){throw new FS.ErrnoError(55)}}FS.hashRemoveNode(new_node)}delete old_node.parent.contents[old_node.name];new_dir.contents[new_name]=old_node;old_node.name=new_name;new_dir.ctime=new_dir.mtime=old_node.parent.ctime=old_node.parent.mtime=Date.now()},unlink(parent,name){delete parent.contents[name];parent.ctime=parent.mtime=Date.now()},rmdir(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(55)}delete parent.contents[name];parent.ctime=parent.mtime=Date.now()},readdir(node){return[".","..",...Object.keys(node.contents)]},symlink(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511|40960,0);node.link=oldpath;return node},readlink(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(28)}return node.link}},stream_ops:{read(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);if(size>8&&contents.subarray){buffer.set(contents.subarray(position,position+size),offset)}else{for(var i=0;i<size;i++)buffer[offset+i]=contents[position+i]}return size},write(stream,buffer,offset,length,position,canOwn){if(buffer.buffer===(growMemViews(),HEAP8).buffer){canOwn=false}if(!length)return 0;var node=stream.node;node.mtime=node.ctime=Date.now();if(buffer.subarray&&(!node.contents||node.contents.subarray)){if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length;return length}else if(node.usedBytes===0&&position===0){node.contents=buffer.slice(offset,offset+length);node.usedBytes=length;return length}else if(position+length<=node.usedBytes){node.contents.set(buffer.subarray(offset,offset+length),position);return length}}MEMFS.expandFileStorage(node,position+length);if(node.contents.subarray&&buffer.subarray){node.contents.set(buffer.subarray(offset,offset+length),position)}else{for(var i=0;i<length;i++){node.contents[position+i]=buffer[offset+i]}}node.usedBytes=Math.max(node.usedBytes,position+length);return length},llseek(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes}}if(position<0){throw new FS.ErrnoError(28)}return position},mmap(stream,length,position,prot,flags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}var ptr;var allocated;var contents=stream.node.contents;if(!(flags&2)&&contents&&contents.buffer===(growMemViews(),HEAP8).buffer){allocated=false;ptr=contents.byteOffset}else{allocated=true;ptr=mmapAlloc(length);if(!ptr){throw new FS.ErrnoError(48)}if(contents){if(position>0||position+length<contents.length){if(contents.subarray){contents=contents.subarray(position,position+length)}else{contents=Array.prototype.slice.call(contents,position,position+length)}}(growMemViews(),HEAP8).set(contents,ptr)}}return{ptr,allocated}},msync(stream,buffer,offset,length,mmapFlags){MEMFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0}}};var FS_modeStringToFlags=str=>{var flagModes={r:0,"r+":2,w:512|64|1,"w+":512|64|2,a:1024|64|1,"a+":1024|64|2};var flags=flagModes[str];if(typeof flags=="undefined"){throw new Error(`Unknown file open mode: ${str}`)}return flags};var FS_getMode=(canRead,canWrite)=>{var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode};var asyncLoad=async url=>{var arrayBuffer=await readAsync(url);return new Uint8Array(arrayBuffer)};var FS_createDataFile=(...args)=>FS.createDataFile(...args);var getUniqueRunDependency=id=>id;var preloadPlugins=[];var FS_handledByPreloadPlugin=async(byteArray,fullname)=>{if(typeof Browser!="undefined")Browser.init();for(var plugin of preloadPlugins){if(plugin["canHandle"](fullname)){return plugin["handle"](byteArray,fullname)}}return byteArray};var FS_preloadFile=async(parent,name,url,canRead,canWrite,dontCreateFile,canOwn,preFinish)=>{var fullname=name?PATH_FS.resolve(PATH.join2(parent,name)):parent;var dep=getUniqueRunDependency(`cp ${fullname}`);addRunDependency(dep);try{var byteArray=url;if(typeof url=="string"){byteArray=await asyncLoad(url)}byteArray=await FS_handledByPreloadPlugin(byteArray,fullname);preFinish?.();if(!dontCreateFile){FS_createDataFile(parent,name,byteArray,canRead,canWrite,canOwn)}}finally{removeRunDependency(dep)}};var FS_createPreloadedFile=(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn,preFinish)=>{FS_preloadFile(parent,name,url,canRead,canWrite,dontCreateFile,canOwn,preFinish).then(onload).catch(onerror)};var FS={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,filesystems:null,syncFSRequests:0,readFiles:{},ErrnoError:class{name="ErrnoError";constructor(errno){this.errno=errno}},FSStream:class{shared={};get object(){return this.node}set object(val){this.node=val}get isRead(){return(this.flags&2097155)!==1}get isWrite(){return(this.flags&2097155)!==0}get isAppend(){return this.flags&1024}get flags(){return this.shared.flags}set flags(val){this.shared.flags=val}get position(){return this.shared.position}set position(val){this.shared.position=val}},FSNode:class{node_ops={};stream_ops={};readMode=292|73;writeMode=146;mounted=null;constructor(parent,name,mode,rdev){if(!parent){parent=this}this.parent=parent;this.mount=parent.mount;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.rdev=rdev;this.atime=this.mtime=this.ctime=Date.now()}get read(){return(this.mode&this.readMode)===this.readMode}set read(val){val?this.mode|=this.readMode:this.mode&=~this.readMode}get write(){return(this.mode&this.writeMode)===this.writeMode}set write(val){val?this.mode|=this.writeMode:this.mode&=~this.writeMode}get isFolder(){return FS.isDir(this.mode)}get isDevice(){return FS.isChrdev(this.mode)}},lookupPath(path,opts={}){if(!path){throw new FS.ErrnoError(44)}opts.follow_mount??=true;if(!PATH.isAbs(path)){path=FS.cwd()+"/"+path}linkloop:for(var nlinks=0;nlinks<40;nlinks++){var parts=path.split("/").filter(p=>!!p);var current=FS.root;var current_path="/";for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){break}if(parts[i]==="."){continue}if(parts[i]===".."){current_path=PATH.dirname(current_path);if(FS.isRoot(current)){path=current_path+"/"+parts.slice(i+1).join("/");nlinks--;continue linkloop}else{current=current.parent}continue}current_path=PATH.join2(current_path,parts[i]);try{current=FS.lookupNode(current,parts[i])}catch(e){if(e?.errno===44&&islast&&opts.noent_okay){return{path:current_path}}throw e}if(FS.isMountpoint(current)&&(!islast||opts.follow_mount)){current=current.mounted.root}if(FS.isLink(current.mode)&&(!islast||opts.follow)){if(!current.node_ops.readlink){throw new FS.ErrnoError(52)}var link=current.node_ops.readlink(current);if(!PATH.isAbs(link)){link=PATH.dirname(current_path)+"/"+link}path=link+"/"+parts.slice(i+1).join("/");continue linkloop}}return{path:current_path,node:current}}throw new FS.ErrnoError(32)},getPath(node){var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=="/"?`${mount}/${path}`:mount+path}path=path?`${node.name}/${path}`:node.name;node=node.parent}},hashName(parentid,name){var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0}return(parentid+hash>>>0)%FS.nameTable.length},hashAddNode(node){var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node},hashRemoveNode(node){var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next}else{var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break}current=current.name_next}}},lookupNode(parent,name){var errCode=FS.mayLookup(parent);if(errCode){throw new FS.ErrnoError(errCode)}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node}}return FS.lookup(parent,name)},createNode(parent,name,mode,rdev){var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node},destroyNode(node){FS.hashRemoveNode(node)},isRoot(node){return node===node.parent},isMountpoint(node){return!!node.mounted},isFile(mode){return(mode&61440)===32768},isDir(mode){return(mode&61440)===16384},isLink(mode){return(mode&61440)===40960},isChrdev(mode){return(mode&61440)===8192},isBlkdev(mode){return(mode&61440)===24576},isFIFO(mode){return(mode&61440)===4096},isSocket(mode){return(mode&49152)===49152},flagsToPermissionString(flag){var perms=["r","w","rw"][flag&3];if(flag&512){perms+="w"}return perms},nodePermissions(node,perms){if(FS.ignorePermissions){return 0}if(perms.includes("r")&&!(node.mode&292)){return 2}else if(perms.includes("w")&&!(node.mode&146)){return 2}else if(perms.includes("x")&&!(node.mode&73)){return 2}return 0},mayLookup(dir){if(!FS.isDir(dir.mode))return 54;var errCode=FS.nodePermissions(dir,"x");if(errCode)return errCode;if(!dir.node_ops.lookup)return 2;return 0},mayCreate(dir,name){if(!FS.isDir(dir.mode)){return 54}try{var node=FS.lookupNode(dir,name);return 20}catch(e){}return FS.nodePermissions(dir,"wx")},mayDelete(dir,name,isdir){var node;try{node=FS.lookupNode(dir,name)}catch(e){return e.errno}var errCode=FS.nodePermissions(dir,"wx");if(errCode){return errCode}if(isdir){if(!FS.isDir(node.mode)){return 54}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return 10}}else{if(FS.isDir(node.mode)){return 31}}return 0},mayOpen(node,flags){if(!node){return 44}if(FS.isLink(node.mode)){return 32}else if(FS.isDir(node.mode)){if(FS.flagsToPermissionString(flags)!=="r"||flags&(512|64)){return 31}}return FS.nodePermissions(node,FS.flagsToPermissionString(flags))},checkOpExists(op,err){if(!op){throw new FS.ErrnoError(err)}return op},MAX_OPEN_FDS:4096,nextfd(){for(var fd=0;fd<=FS.MAX_OPEN_FDS;fd++){if(!FS.streams[fd]){return fd}}throw new FS.ErrnoError(33)},getStreamChecked(fd){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8)}return stream},getStream:fd=>FS.streams[fd],createStream(stream,fd=-1){stream=Object.assign(new FS.FSStream,stream);if(fd==-1){fd=FS.nextfd()}stream.fd=fd;FS.streams[fd]=stream;return stream},closeStream(fd){FS.streams[fd]=null},dupStream(origStream,fd=-1){var stream=FS.createStream(origStream,fd);stream.stream_ops?.dup?.(stream);return stream},doSetAttr(stream,node,attr){var setattr=stream?.stream_ops.setattr;var arg=setattr?stream:node;setattr??=node.node_ops.setattr;FS.checkOpExists(setattr,63);setattr(arg,attr)},chrdev_stream_ops:{open(stream){var device=FS.getDevice(stream.node.rdev);stream.stream_ops=device.stream_ops;stream.stream_ops.open?.(stream)},llseek(){throw new FS.ErrnoError(70)}},major:dev=>dev>>8,minor:dev=>dev&255,makedev:(ma,mi)=>ma<<8|mi,registerDevice(dev,ops){FS.devices[dev]={stream_ops:ops}},getDevice:dev=>FS.devices[dev],getMounts(mount){var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push(...m.mounts)}return mounts},syncfs(populate,callback){if(typeof populate=="function"){callback=populate;populate=false}FS.syncFSRequests++;if(FS.syncFSRequests>1){err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`)}var mounts=FS.getMounts(FS.root.mount);var completed=0;function doCallback(errCode){FS.syncFSRequests--;return callback(errCode)}function done(errCode){if(errCode){if(!done.errored){done.errored=true;return doCallback(errCode)}return}if(++completed>=mounts.length){doCallback(null)}}for(var mount of mounts){if(mount.type.syncfs){mount.type.syncfs(mount,populate,done)}else{done(null)}}},mount(type,opts,mountpoint){var root=mountpoint==="/";var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(10)}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}}var mount={type,opts,mountpoint,mounts:[]};var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot}else if(node){node.mounted=mount;if(node.mount){node.mount.mounts.push(mount)}}return mountRoot},unmount(mountpoint){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(28)}var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);for(var[hash,current]of Object.entries(FS.nameTable)){while(current){var next=current.name_next;if(mounts.includes(current.mount)){FS.destroyNode(current)}current=next}}node.mounted=null;var idx=node.mount.mounts.indexOf(mount);node.mount.mounts.splice(idx,1)},lookup(parent,name){return parent.node_ops.lookup(parent,name)},mknod(path,mode,dev){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name){throw new FS.ErrnoError(28)}if(name==="."||name===".."){throw new FS.ErrnoError(20)}var errCode=FS.mayCreate(parent,name);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.mknod){throw new FS.ErrnoError(63)}return parent.node_ops.mknod(parent,name,mode,dev)},statfs(path){return FS.statfsNode(FS.lookupPath(path,{follow:true}).node)},statfsStream(stream){return FS.statfsNode(stream.node)},statfsNode(node){var rtn={bsize:4096,frsize:4096,blocks:1e6,bfree:5e5,bavail:5e5,files:FS.nextInode,ffree:FS.nextInode-1,fsid:42,flags:2,namelen:255};if(node.node_ops.statfs){Object.assign(rtn,node.node_ops.statfs(node.mount.opts.root))}return rtn},create(path,mode=438){mode&=4095;mode|=32768;return FS.mknod(path,mode,0)},mkdir(path,mode=511){mode&=511|512;mode|=16384;return FS.mknod(path,mode,0)},mkdirTree(path,mode){var dirs=path.split("/");var d="";for(var dir of dirs){if(!dir)continue;if(d||PATH.isAbs(path))d+="/";d+=dir;try{FS.mkdir(d,mode)}catch(e){if(e.errno!=20)throw e}}},mkdev(path,mode,dev){if(typeof dev=="undefined"){dev=mode;mode=438}mode|=8192;return FS.mknod(path,mode,dev)},symlink(oldpath,newpath){if(!PATH_FS.resolve(oldpath)){throw new FS.ErrnoError(44)}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var newname=PATH.basename(newpath);var errCode=FS.mayCreate(parent,newname);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.symlink){throw new FS.ErrnoError(63)}return parent.node_ops.symlink(parent,newname,oldpath)},rename(old_path,new_path){var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);var lookup,old_dir,new_dir;lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node;if(!old_dir||!new_dir)throw new FS.ErrnoError(44);if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(75)}var old_node=FS.lookupNode(old_dir,old_name);var relative=PATH_FS.relative(old_path,new_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(28)}relative=PATH_FS.relative(new_path,old_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(55)}var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(old_node===new_node){return}var isdir=FS.isDir(old_node.mode);var errCode=FS.mayDelete(old_dir,old_name,isdir);if(errCode){throw new FS.ErrnoError(errCode)}errCode=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(errCode){throw new FS.ErrnoError(errCode)}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(63)}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(10)}if(new_dir!==old_dir){errCode=FS.nodePermissions(old_dir,"w");if(errCode){throw new FS.ErrnoError(errCode)}}FS.hashRemoveNode(old_node);try{old_dir.node_ops.rename(old_node,new_dir,new_name);old_node.parent=new_dir}catch(e){throw e}finally{FS.hashAddNode(old_node)}},rmdir(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,true);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.rmdir(parent,name);FS.destroyNode(node)},readdir(path){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;var readdir=FS.checkOpExists(node.node_ops.readdir,54);return readdir(node)},unlink(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,false);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.unlink){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.unlink(parent,name);FS.destroyNode(node)},readlink(path){var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(44)}if(!link.node_ops.readlink){throw new FS.ErrnoError(28)}return link.node_ops.readlink(link)},stat(path,dontFollow){var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;var getattr=FS.checkOpExists(node.node_ops.getattr,63);return getattr(node)},fstat(fd){var stream=FS.getStreamChecked(fd);var node=stream.node;var getattr=stream.stream_ops.getattr;var arg=getattr?stream:node;getattr??=node.node_ops.getattr;FS.checkOpExists(getattr,63);return getattr(arg)},lstat(path){return FS.stat(path,true)},doChmod(stream,node,mode,dontFollow){FS.doSetAttr(stream,node,{mode:mode&4095|node.mode&~4095,ctime:Date.now(),dontFollow})},chmod(path,mode,dontFollow){var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}FS.doChmod(null,node,mode,dontFollow)},lchmod(path,mode){FS.chmod(path,mode,true)},fchmod(fd,mode){var stream=FS.getStreamChecked(fd);FS.doChmod(stream,stream.node,mode,false)},doChown(stream,node,dontFollow){FS.doSetAttr(stream,node,{timestamp:Date.now(),dontFollow})},chown(path,uid,gid,dontFollow){var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}FS.doChown(null,node,dontFollow)},lchown(path,uid,gid){FS.chown(path,uid,gid,true)},fchown(fd,uid,gid){var stream=FS.getStreamChecked(fd);FS.doChown(stream,stream.node,false)},doTruncate(stream,node,len){if(FS.isDir(node.mode)){throw new FS.ErrnoError(31)}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(28)}var errCode=FS.nodePermissions(node,"w");if(errCode){throw new FS.ErrnoError(errCode)}FS.doSetAttr(stream,node,{size:len,timestamp:Date.now()})},truncate(path,len){if(len<0){throw new FS.ErrnoError(28)}var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node}else{node=path}FS.doTruncate(null,node,len)},ftruncate(fd,len){var stream=FS.getStreamChecked(fd);if(len<0||(stream.flags&2097155)===0){throw new FS.ErrnoError(28)}FS.doTruncate(stream,stream.node,len)},utime(path,atime,mtime){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;var setattr=FS.checkOpExists(node.node_ops.setattr,63);setattr(node,{atime,mtime})},open(path,flags,mode=438){if(path===""){throw new FS.ErrnoError(44)}flags=typeof flags=="string"?FS_modeStringToFlags(flags):flags;if(flags&64){mode=mode&4095|32768}else{mode=0}var node;var isDirPath;if(typeof path=="object"){node=path}else{isDirPath=path.endsWith("/");var lookup=FS.lookupPath(path,{follow:!(flags&131072),noent_okay:true});node=lookup.node;path=lookup.path}var created=false;if(flags&64){if(node){if(flags&128){throw new FS.ErrnoError(20)}}else if(isDirPath){throw new FS.ErrnoError(31)}else{node=FS.mknod(path,mode|511,0);created=true}}if(!node){throw new FS.ErrnoError(44)}if(FS.isChrdev(node.mode)){flags&=~512}if(flags&65536&&!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}if(!created){var errCode=FS.mayOpen(node,flags);if(errCode){throw new FS.ErrnoError(errCode)}}if(flags&512&&!created){FS.truncate(node,0)}flags&=~(128|512|131072);var stream=FS.createStream({node,path:FS.getPath(node),flags,seekable:true,position:0,stream_ops:node.stream_ops,ungotten:[],error:false});if(stream.stream_ops.open){stream.stream_ops.open(stream)}if(created){FS.chmod(node,mode&511)}if(Module["logReadFiles"]&&!(flags&1)){if(!(path in FS.readFiles)){FS.readFiles[path]=1}}return stream},close(stream){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(stream.getdents)stream.getdents=null;try{if(stream.stream_ops.close){stream.stream_ops.close(stream)}}catch(e){throw e}finally{FS.closeStream(stream.fd)}stream.fd=null},isClosed(stream){return stream.fd===null},llseek(stream,offset,whence){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(70)}if(whence!=0&&whence!=1&&whence!=2){throw new FS.ErrnoError(28)}stream.position=stream.stream_ops.llseek(stream,offset,whence);stream.ungotten=[];return stream.position},read(stream,buffer,offset,length,position){if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.read){throw new FS.ErrnoError(28)}var seeking=typeof position!="undefined";if(!seeking){position=stream.position}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead},write(stream,buffer,offset,length,position,canOwn){if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.write){throw new FS.ErrnoError(28)}if(stream.seekable&&stream.flags&1024){FS.llseek(stream,0,2)}var seeking=typeof position!="undefined";if(!seeking){position=stream.position}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;return bytesWritten},mmap(stream,length,position,prot,flags){if((prot&2)!==0&&(flags&2)===0&&(stream.flags&2097155)!==2){throw new FS.ErrnoError(2)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(2)}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(43)}if(!length){throw new FS.ErrnoError(28)}return stream.stream_ops.mmap(stream,length,position,prot,flags)},msync(stream,buffer,offset,length,mmapFlags){if(!stream.stream_ops.msync){return 0}return stream.stream_ops.msync(stream,buffer,offset,length,mmapFlags)},ioctl(stream,cmd,arg){if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(59)}return stream.stream_ops.ioctl(stream,cmd,arg)},readFile(path,opts={}){opts.flags=opts.flags||0;opts.encoding=opts.encoding||"binary";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){abort(`Invalid encoding type "${opts.encoding}"`)}var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==="utf8"){buf=UTF8ArrayToString(buf)}FS.close(stream);return buf},writeFile(path,data,opts={}){opts.flags=opts.flags||577;var stream=FS.open(path,opts.flags,opts.mode);if(typeof data=="string"){data=new Uint8Array(intArrayFromString(data,true))}if(ArrayBuffer.isView(data)){FS.write(stream,data,0,data.byteLength,undefined,opts.canOwn)}else{abort("Unsupported data type")}FS.close(stream)},cwd:()=>FS.currentPath,chdir(path){var lookup=FS.lookupPath(path,{follow:true});if(lookup.node===null){throw new FS.ErrnoError(44)}if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(54)}var errCode=FS.nodePermissions(lookup.node,"x");if(errCode){throw new FS.ErrnoError(errCode)}FS.currentPath=lookup.path},createDefaultDirectories(){FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user")},createDefaultDevices(){FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:()=>0,write:(stream,buffer,offset,length,pos)=>length,llseek:()=>0});FS.mkdev("/dev/null",FS.makedev(1,3));TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var randomBuffer=new Uint8Array(1024),randomLeft=0;var randomByte=()=>{if(randomLeft===0){randomFill(randomBuffer);randomLeft=randomBuffer.byteLength}return randomBuffer[--randomLeft]};FS.createDevice("/dev","random",randomByte);FS.createDevice("/dev","urandom",randomByte);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp")},createSpecialDirectories(){FS.mkdir("/proc");var proc_self=FS.mkdir("/proc/self");FS.mkdir("/proc/self/fd");FS.mount({mount(){var node=FS.createNode(proc_self,"fd",16895,73);node.stream_ops={llseek:MEMFS.stream_ops.llseek};node.node_ops={lookup(parent,name){var fd=+name;var stream=FS.getStreamChecked(fd);var ret={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>stream.path},id:fd+1};ret.parent=ret;return ret},readdir(){return Array.from(FS.streams.entries()).filter(([k,v])=>v).map(([k,v])=>k.toString())}};return node}},{},"/proc/self/fd")},createStandardStreams(input,output,error){if(input){FS.createDevice("/dev","stdin",input)}else{FS.symlink("/dev/tty","/dev/stdin")}if(output){FS.createDevice("/dev","stdout",null,output)}else{FS.symlink("/dev/tty","/dev/stdout")}if(error){FS.createDevice("/dev","stderr",null,error)}else{FS.symlink("/dev/tty1","/dev/stderr")}var stdin=FS.open("/dev/stdin",0);var stdout=FS.open("/dev/stdout",1);var stderr=FS.open("/dev/stderr",1)},staticInit(){FS.nameTable=new Array(4096);FS.mount(MEMFS,{},"/");FS.createDefaultDirectories();FS.createDefaultDevices();FS.createSpecialDirectories();FS.filesystems={MEMFS}},init(input,output,error){FS.initialized=true;input??=Module["stdin"];output??=Module["stdout"];error??=Module["stderr"];FS.createStandardStreams(input,output,error)},quit(){FS.initialized=false;for(var stream of FS.streams){if(stream){FS.close(stream)}}},findObject(path,dontResolveLastLink){var ret=FS.analyzePath(path,dontResolveLastLink);if(!ret.exists){return null}return ret.object},analyzePath(path,dontResolveLastLink){try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==="/"}catch(e){ret.error=e.errno}return ret},createPath(parent,path,canRead,canWrite){parent=typeof parent=="string"?parent:FS.getPath(parent);var parts=path.split("/").reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current)}catch(e){if(e.errno!=20)throw e}parent=current}return current},createFile(parent,name,properties,canRead,canWrite){var path=PATH.join2(typeof parent=="string"?parent:FS.getPath(parent),name);var mode=FS_getMode(canRead,canWrite);return FS.create(path,mode)},createDataFile(parent,name,data,canRead,canWrite,canOwn){var path=name;if(parent){parent=typeof parent=="string"?parent:FS.getPath(parent);path=name?PATH.join2(parent,name):parent}var mode=FS_getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){if(typeof data=="string"){var arr=new Array(data.length);for(var i=0,len=data.length;i<len;++i)arr[i]=data.charCodeAt(i);data=arr}FS.chmod(node,mode|146);var stream=FS.open(node,577);FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode)}},createDevice(parent,name,input,output){var path=PATH.join2(typeof parent=="string"?parent:FS.getPath(parent),name);var mode=FS_getMode(!!input,!!output);FS.createDevice.major??=64;var dev=FS.makedev(FS.createDevice.major++,0);FS.registerDevice(dev,{open(stream){stream.seekable=false},close(stream){if(output?.buffer?.length){output(10)}},read(stream,buffer,offset,length,pos){var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input()}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.atime=Date.now()}return bytesRead},write(stream,buffer,offset,length,pos){for(var i=0;i<length;i++){try{output(buffer[offset+i])}catch(e){throw new FS.ErrnoError(29)}}if(length){stream.node.mtime=stream.node.ctime=Date.now()}return i}});return FS.mkdev(path,mode,dev)},forceLoadFile(obj){if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;if(globalThis.XMLHttpRequest){abort("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")}else{try{obj.contents=readBinary(obj.url)}catch(e){throw new FS.ErrnoError(29)}}},createLazyFile(parent,name,url,canRead,canWrite){class LazyUint8Array{lengthKnown=false;chunks=[];get(idx){if(idx>this.length-1||idx<0){return undefined}var chunkOffset=idx%this.chunkSize;var chunkNum=idx/this.chunkSize|0;return this.getter(chunkNum)[chunkOffset]}setDataGetter(getter){this.getter=getter}cacheLength(){var xhr=new XMLHttpRequest;xhr.open("HEAD",url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))abort("Couldn\'t load "+url+". Status: "+xhr.status);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var usesGzip=(header=xhr.getResponseHeader("Content-Encoding"))&&header==="gzip";var chunkSize=1024*1024;if(!hasByteServing)chunkSize=datalength;var doXHR=(from,to)=>{if(from>to)abort("invalid range ("+from+", "+to+") or no bytes requested!");if(to>datalength-1)abort("only "+datalength+" bytes available! programmer error!");var xhr=new XMLHttpRequest;xhr.open("GET",url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range","bytes="+from+"-"+to);xhr.responseType="arraybuffer";if(xhr.overrideMimeType){xhr.overrideMimeType("text/plain; charset=x-user-defined")}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))abort("Couldn\'t load "+url+". Status: "+xhr.status);if(xhr.response!==undefined){return new Uint8Array(xhr.response||[])}return intArrayFromString(xhr.responseText||"",true)};var lazyArray=this;lazyArray.setDataGetter(chunkNum=>{var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;end=Math.min(end,datalength-1);if(typeof lazyArray.chunks[chunkNum]=="undefined"){lazyArray.chunks[chunkNum]=doXHR(start,end)}if(typeof lazyArray.chunks[chunkNum]=="undefined")abort("doXHR failed!");return lazyArray.chunks[chunkNum]});if(usesGzip||!datalength){chunkSize=datalength=1;datalength=this.getter(0).length;chunkSize=datalength;out("LazyFiles on gzip forces download of the whole file when length is accessed")}this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true}get length(){if(!this.lengthKnown){this.cacheLength()}return this._length}get chunkSize(){if(!this.lengthKnown){this.cacheLength()}return this._chunkSize}}if(globalThis.XMLHttpRequest){if(!ENVIRONMENT_IS_WORKER)abort("Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc");var lazyArray=new LazyUint8Array;var properties={isDevice:false,contents:lazyArray}}else{var properties={isDevice:false,url}}var node=FS.createFile(parent,name,properties,canRead,canWrite);if(properties.contents){node.contents=properties.contents}else if(properties.url){node.contents=null;node.url=properties.url}Object.defineProperties(node,{usedBytes:{get:function(){return this.contents.length}}});var stream_ops={};for(const[key,fn]of Object.entries(node.stream_ops)){stream_ops[key]=(...args)=>{FS.forceLoadFile(node);return fn(...args)}}function writeChunks(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);if(contents.slice){for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i]}}else{for(var i=0;i<size;i++){buffer[offset+i]=contents.get(position+i)}}return size}stream_ops.read=(stream,buffer,offset,length,position)=>{FS.forceLoadFile(node);return writeChunks(stream,buffer,offset,length,position)};stream_ops.mmap=(stream,length,position,prot,flags)=>{FS.forceLoadFile(node);var ptr=mmapAlloc(length);if(!ptr){throw new FS.ErrnoError(48)}writeChunks(stream,(growMemViews(),HEAP8),ptr,length,position);return{ptr,allocated:true}};node.stream_ops=stream_ops;return node}};var UTF8ToString=(ptr,maxBytesToRead,ignoreNul)=>ptr?UTF8ArrayToString((growMemViews(),HEAPU8),ptr,maxBytesToRead,ignoreNul):"";var SYSCALLS={DEFAULT_POLLMASK:5,calculateAt(dirfd,path,allowEmpty){if(PATH.isAbs(path)){return path}var dir;if(dirfd===-100){dir=FS.cwd()}else{var dirstream=SYSCALLS.getStreamFromFD(dirfd);dir=dirstream.path}if(path.length==0){if(!allowEmpty){throw new FS.ErrnoError(44)}return dir}return dir+"/"+path},writeStat(buf,stat){(growMemViews(),HEAPU32)[buf/4]=stat.dev;(growMemViews(),HEAPU32)[(buf+4)/4]=stat.mode;(growMemViews(),HEAPU64)[(buf+8)/8]=BigInt(stat.nlink);(growMemViews(),HEAPU32)[(buf+16)/4]=stat.uid;(growMemViews(),HEAPU32)[(buf+20)/4]=stat.gid;(growMemViews(),HEAPU32)[(buf+24)/4]=stat.rdev;(growMemViews(),HEAP64)[(buf+32)/8]=BigInt(stat.size);(growMemViews(),HEAP32)[(buf+40)/4]=4096;(growMemViews(),HEAP32)[(buf+44)/4]=stat.blocks;var atime=stat.atime.getTime();var mtime=stat.mtime.getTime();var ctime=stat.ctime.getTime();(growMemViews(),HEAP64)[(buf+48)/8]=BigInt(Math.floor(atime/1e3));(growMemViews(),HEAPU64)[(buf+56)/8]=BigInt(atime%1e3*1e3*1e3);(growMemViews(),HEAP64)[(buf+64)/8]=BigInt(Math.floor(mtime/1e3));(growMemViews(),HEAPU64)[(buf+72)/8]=BigInt(mtime%1e3*1e3*1e3);(growMemViews(),HEAP64)[(buf+80)/8]=BigInt(Math.floor(ctime/1e3));(growMemViews(),HEAPU64)[(buf+88)/8]=BigInt(ctime%1e3*1e3*1e3);(growMemViews(),HEAP64)[(buf+96)/8]=BigInt(stat.ino);return 0},writeStatFs(buf,stats){(growMemViews(),HEAPU32)[(buf+8)/4]=stats.bsize;(growMemViews(),HEAPU32)[(buf+72)/4]=stats.bsize;(growMemViews(),HEAP64)[(buf+16)/8]=BigInt(stats.blocks);(growMemViews(),HEAP64)[(buf+24)/8]=BigInt(stats.bfree);(growMemViews(),HEAP64)[(buf+32)/8]=BigInt(stats.bavail);(growMemViews(),HEAP64)[(buf+40)/8]=BigInt(stats.files);(growMemViews(),HEAP64)[(buf+48)/8]=BigInt(stats.ffree);(growMemViews(),HEAPU32)[(buf+56)/4]=stats.fsid;(growMemViews(),HEAPU32)[(buf+80)/4]=stats.flags;(growMemViews(),HEAPU32)[(buf+64)/4]=stats.namelen},doMsync(addr,stream,len,flags,offset){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}if(flags&2){return 0}var buffer=(growMemViews(),HEAPU8).slice(addr,addr+len);FS.msync(stream,buffer,offset,len,flags)},getStreamFromFD(fd){var stream=FS.getStreamChecked(fd);return stream},varargs:undefined,getStr(ptr){var ret=UTF8ToString(ptr);return ret}};function ___syscall_fcntl64(fd,cmd,varargs){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(3,0,1,fd,cmd,varargs);varargs=bigintToI53Checked(varargs);SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(cmd){case 0:{var arg=syscallGetVarargI();if(arg<0){return-28}while(FS.streams[arg]){arg++}var newStream;newStream=FS.dupStream(stream,arg);return newStream.fd}case 1:case 2:return 0;case 3:return stream.flags;case 4:{var arg=syscallGetVarargI();stream.flags|=arg;return 0}case 5:{var arg=syscallGetVarargP();var offset=0;(growMemViews(),HEAP16)[(arg+offset)/2]=2;return 0}case 6:case 7:return 0}return-28}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_fstat64(fd,buf){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(4,0,1,fd,buf);buf=bigintToI53Checked(buf);try{return SYSCALLS.writeStat(buf,FS.fstat(fd))}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}var stringToUTF8=(str,outPtr,maxBytesToWrite)=>stringToUTF8Array(str,(growMemViews(),HEAPU8),outPtr,maxBytesToWrite);function ___syscall_getcwd(buf,size){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(5,0,1,buf,size);buf=bigintToI53Checked(buf);size=bigintToI53Checked(size);try{if(size===0)return-28;var cwd=FS.cwd();var cwdLengthInBytes=lengthBytesUTF8(cwd)+1;if(size<cwdLengthInBytes)return-68;stringToUTF8(cwd,buf,size);return cwdLengthInBytes}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_getdents64(fd,dirp,count){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(6,0,1,fd,dirp,count);dirp=bigintToI53Checked(dirp);count=bigintToI53Checked(count);try{var stream=SYSCALLS.getStreamFromFD(fd);stream.getdents||=FS.readdir(stream.path);var struct_size=280;var pos=0;var off=FS.llseek(stream,0,1);var startIdx=Math.floor(off/struct_size);var endIdx=Math.min(stream.getdents.length,startIdx+Math.floor(count/struct_size));for(var idx=startIdx;idx<endIdx;idx++){var id;var type;var name=stream.getdents[idx];if(name==="."){id=stream.node.id;type=4}else if(name===".."){var lookup=FS.lookupPath(stream.path,{parent:true});id=lookup.node.id;type=4}else{var child;try{child=FS.lookupNode(stream.node,name)}catch(e){if(e?.errno===28){continue}throw e}id=child.id;type=FS.isChrdev(child.mode)?2:FS.isDir(child.mode)?4:FS.isLink(child.mode)?10:8}(growMemViews(),HEAP64)[(dirp+pos)/8]=BigInt(id);(growMemViews(),HEAP64)[(dirp+pos+8)/8]=BigInt((idx+1)*struct_size);(growMemViews(),HEAP16)[(dirp+pos+16)/2]=280;(growMemViews(),HEAP8)[dirp+pos+18]=type;stringToUTF8(name,dirp+pos+19,256);pos+=struct_size}FS.llseek(stream,idx*struct_size,0);return pos}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_ioctl(fd,op,varargs){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(7,0,1,fd,op,varargs);varargs=bigintToI53Checked(varargs);SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(op){case 21509:{if(!stream.tty)return-59;return 0}case 21505:{if(!stream.tty)return-59;if(stream.tty.ops.ioctl_tcgets){var termios=stream.tty.ops.ioctl_tcgets(stream);var argp=syscallGetVarargP();(growMemViews(),HEAP32)[argp/4]=termios.c_iflag||0;(growMemViews(),HEAP32)[(argp+4)/4]=termios.c_oflag||0;(growMemViews(),HEAP32)[(argp+8)/4]=termios.c_cflag||0;(growMemViews(),HEAP32)[(argp+12)/4]=termios.c_lflag||0;for(var i=0;i<32;i++){(growMemViews(),HEAP8)[argp+i+17]=termios.c_cc[i]||0}return 0}return 0}case 21510:case 21511:case 21512:{if(!stream.tty)return-59;return 0}case 21506:case 21507:case 21508:{if(!stream.tty)return-59;if(stream.tty.ops.ioctl_tcsets){var argp=syscallGetVarargP();var c_iflag=(growMemViews(),HEAP32)[argp/4];var c_oflag=(growMemViews(),HEAP32)[(argp+4)/4];var c_cflag=(growMemViews(),HEAP32)[(argp+8)/4];var c_lflag=(growMemViews(),HEAP32)[(argp+12)/4];var c_cc=[];for(var i=0;i<32;i++){c_cc.push((growMemViews(),HEAP8)[argp+i+17])}return stream.tty.ops.ioctl_tcsets(stream.tty,op,{c_iflag,c_oflag,c_cflag,c_lflag,c_cc})}return 0}case 21519:{if(!stream.tty)return-59;var argp=syscallGetVarargP();(growMemViews(),HEAP32)[argp/4]=0;return 0}case 21520:{if(!stream.tty)return-59;return-28}case 21537:case 21531:{var argp=syscallGetVarargP();return FS.ioctl(stream,op,argp)}case 21523:{if(!stream.tty)return-59;if(stream.tty.ops.ioctl_tiocgwinsz){var winsize=stream.tty.ops.ioctl_tiocgwinsz(stream.tty);var argp=syscallGetVarargP();(growMemViews(),HEAP16)[argp/2]=winsize[0];(growMemViews(),HEAP16)[(argp+2)/2]=winsize[1]}return 0}case 21524:{if(!stream.tty)return-59;return 0}case 21515:{if(!stream.tty)return-59;return 0}default:return-28}}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_lstat64(path,buf){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(8,0,1,path,buf);path=bigintToI53Checked(path);buf=bigintToI53Checked(buf);try{path=SYSCALLS.getStr(path);return SYSCALLS.writeStat(buf,FS.lstat(path))}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_newfstatat(dirfd,path,buf,flags){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(9,0,1,dirfd,path,buf,flags);path=bigintToI53Checked(path);buf=bigintToI53Checked(buf);try{path=SYSCALLS.getStr(path);var nofollow=flags&256;var allowEmpty=flags&4096;flags=flags&~6400;path=SYSCALLS.calculateAt(dirfd,path,allowEmpty);return SYSCALLS.writeStat(buf,nofollow?FS.lstat(path):FS.stat(path))}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_openat(dirfd,path,flags,varargs){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(10,0,1,dirfd,path,flags,varargs);path=bigintToI53Checked(path);varargs=bigintToI53Checked(varargs);SYSCALLS.varargs=varargs;try{path=SYSCALLS.getStr(path);path=SYSCALLS.calculateAt(dirfd,path);var mode=varargs?syscallGetVarargI():0;return FS.open(path,flags,mode).fd}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function ___syscall_stat64(path,buf){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(11,0,1,path,buf);path=bigintToI53Checked(path);buf=bigintToI53Checked(buf);try{path=SYSCALLS.getStr(path);return SYSCALLS.writeStat(buf,FS.stat(path))}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}var __abort_js=()=>abort("");function __emscripten_init_main_thread_js(tb){tb=bigintToI53Checked(tb);__emscripten_thread_init(tb,!ENVIRONMENT_IS_WORKER,1,!ENVIRONMENT_IS_WEB,5242880,false);PThread.threadInitTLS()}var handleException=e=>{if(e instanceof ExitStatus||e=="unwind"){return EXITSTATUS}quit_(1,e)};var maybeExit=()=>{if(!keepRuntimeAlive()){try{if(ENVIRONMENT_IS_PTHREAD){if(_pthread_self())__emscripten_thread_exit(EXITSTATUS);return}_exit(EXITSTATUS)}catch(e){handleException(e)}}};var callUserCallback=func=>{if(ABORT){return}try{func();maybeExit()}catch(e){handleException(e)}};function __emscripten_thread_mailbox_await(pthread_ptr){pthread_ptr=bigintToI53Checked(pthread_ptr);if(Atomics.waitAsync){var wait=Atomics.waitAsync((growMemViews(),HEAP32),pthread_ptr/4,pthread_ptr);wait.value.then(checkMailbox);var waitingAsync=pthread_ptr+228;Atomics.store((growMemViews(),HEAP32),waitingAsync/4,1)}}var checkMailbox=()=>callUserCallback(()=>{var pthread_ptr=_pthread_self();if(pthread_ptr){__emscripten_thread_mailbox_await(pthread_ptr);__emscripten_check_mailbox()}});function __emscripten_notify_mailbox_postmessage(targetThread,currThreadId){targetThread=bigintToI53Checked(targetThread);currThreadId=bigintToI53Checked(currThreadId);if(targetThread==currThreadId){setTimeout(checkMailbox)}else if(ENVIRONMENT_IS_PTHREAD){postMessage({targetThread,cmd:"checkMailbox"})}else{var worker=PThread.pthreads[targetThread];if(!worker){return}worker.postMessage({cmd:"checkMailbox"})}}var proxiedJSCallArgs=[];function __emscripten_receive_on_main_thread_js(funcIndex,emAsmAddr,callingThread,numCallArgs,args){emAsmAddr=bigintToI53Checked(emAsmAddr);callingThread=bigintToI53Checked(callingThread);args=bigintToI53Checked(args);numCallArgs/=2;proxiedJSCallArgs.length=numCallArgs;var b=args/8;for(var i=0;i<numCallArgs;i++){if((growMemViews(),HEAP64)[b+2*i]){proxiedJSCallArgs[i]=(growMemViews(),HEAP64)[b+2*i+1]}else{proxiedJSCallArgs[i]=(growMemViews(),HEAPF64)[b+2*i+1]}}var func=proxiedFunctionTable[funcIndex];PThread.currentProxiedOperationCallerThread=callingThread;var rtn=func(...proxiedJSCallArgs);PThread.currentProxiedOperationCallerThread=0;if(typeof rtn=="bigint"){rtn=bigintToI53Checked(rtn)}return rtn}function __emscripten_thread_cleanup(thread){thread=bigintToI53Checked(thread);if(!ENVIRONMENT_IS_PTHREAD)cleanupThread(thread);else postMessage({cmd:"cleanupThread",thread})}function __emscripten_thread_set_strongref(thread){thread=bigintToI53Checked(thread);if(ENVIRONMENT_IS_NODE){PThread.pthreads[thread].ref()}}var isLeapYear=year=>year%4===0&&(year%100!==0||year%400===0);var MONTH_DAYS_LEAP_CUMULATIVE=[0,31,60,91,121,152,182,213,244,274,305,335];var MONTH_DAYS_REGULAR_CUMULATIVE=[0,31,59,90,120,151,181,212,243,273,304,334];var ydayFromDate=date=>{var leap=isLeapYear(date.getFullYear());var monthDaysCumulative=leap?MONTH_DAYS_LEAP_CUMULATIVE:MONTH_DAYS_REGULAR_CUMULATIVE;var yday=monthDaysCumulative[date.getMonth()]+date.getDate()-1;return yday};function __localtime_js(time,tmPtr){time=bigintToI53Checked(time);tmPtr=bigintToI53Checked(tmPtr);var date=new Date(time*1e3);(growMemViews(),HEAP32)[tmPtr/4]=date.getSeconds();(growMemViews(),HEAP32)[(tmPtr+4)/4]=date.getMinutes();(growMemViews(),HEAP32)[(tmPtr+8)/4]=date.getHours();(growMemViews(),HEAP32)[(tmPtr+12)/4]=date.getDate();(growMemViews(),HEAP32)[(tmPtr+16)/4]=date.getMonth();(growMemViews(),HEAP32)[(tmPtr+20)/4]=date.getFullYear()-1900;(growMemViews(),HEAP32)[(tmPtr+24)/4]=date.getDay();var yday=ydayFromDate(date)|0;(growMemViews(),HEAP32)[(tmPtr+28)/4]=yday;(growMemViews(),HEAP64)[(tmPtr+40)/8]=BigInt(-(date.getTimezoneOffset()*60));var start=new Date(date.getFullYear(),0,1);var summerOffset=new Date(date.getFullYear(),6,1).getTimezoneOffset();var winterOffset=start.getTimezoneOffset();var dst=(summerOffset!=winterOffset&&date.getTimezoneOffset()==Math.min(winterOffset,summerOffset))|0;(growMemViews(),HEAP32)[(tmPtr+32)/4]=dst}function __mmap_js(len,prot,flags,fd,offset,allocated,addr){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(12,0,1,len,prot,flags,fd,offset,allocated,addr);len=bigintToI53Checked(len);offset=bigintToI53Checked(offset);allocated=bigintToI53Checked(allocated);addr=bigintToI53Checked(addr);try{var stream=SYSCALLS.getStreamFromFD(fd);var res=FS.mmap(stream,len,offset,prot,flags);var ptr=res.ptr;(growMemViews(),HEAP32)[allocated/4]=res.allocated;(growMemViews(),HEAPU64)[addr/8]=BigInt(ptr);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}function __munmap_js(addr,len,prot,flags,fd,offset){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(13,0,1,addr,len,prot,flags,fd,offset);addr=bigintToI53Checked(addr);len=bigintToI53Checked(len);offset=bigintToI53Checked(offset);try{var stream=SYSCALLS.getStreamFromFD(fd);if(prot&2){SYSCALLS.doMsync(addr,stream,len,flags,offset)}}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return-e.errno}}var __tzset_js=function(timezone,daylight,std_name,dst_name){timezone=bigintToI53Checked(timezone);daylight=bigintToI53Checked(daylight);std_name=bigintToI53Checked(std_name);dst_name=bigintToI53Checked(dst_name);var currentYear=(new Date).getFullYear();var winter=new Date(currentYear,0,1);var summer=new Date(currentYear,6,1);var winterOffset=winter.getTimezoneOffset();var summerOffset=summer.getTimezoneOffset();var stdTimezoneOffset=Math.max(winterOffset,summerOffset);(growMemViews(),HEAPU64)[timezone/8]=BigInt(stdTimezoneOffset*60);(growMemViews(),HEAP32)[daylight/4]=Number(winterOffset!=summerOffset);var extractZone=timezoneOffset=>{var sign=timezoneOffset>=0?"-":"+";var absOffset=Math.abs(timezoneOffset);var hours=String(Math.floor(absOffset/60)).padStart(2,"0");var minutes=String(absOffset%60).padStart(2,"0");return`UTC${sign}${hours}${minutes}`};var winterName=extractZone(winterOffset);var summerName=extractZone(summerOffset);if(summerOffset<winterOffset){stringToUTF8(winterName,std_name,17);stringToUTF8(summerName,dst_name,17)}else{stringToUTF8(winterName,dst_name,17);stringToUTF8(summerName,std_name,17)}};var _emscripten_get_now=()=>performance.timeOrigin+performance.now();var _emscripten_date_now=()=>Date.now();var nowIsMonotonic=1;var checkWasiClock=clock_id=>clock_id>=0&&clock_id<=3;function _clock_time_get(clk_id,ignored_precision,ptime){ignored_precision=bigintToI53Checked(ignored_precision);ptime=bigintToI53Checked(ptime);if(!checkWasiClock(clk_id)){return 28}var now;if(clk_id===0){now=_emscripten_date_now()}else if(nowIsMonotonic){now=_emscripten_get_now()}else{return 52}var nsec=Math.round(now*1e3*1e3);(growMemViews(),HEAP64)[ptime/8]=BigInt(nsec);return 0}var _emscripten_check_blocking_allowed=()=>{};var runtimeKeepalivePush=()=>{runtimeKeepaliveCounter+=1};var _emscripten_exit_with_live_runtime=()=>{runtimeKeepalivePush();throw"unwind"};var jsStackTrace=()=>(new Error).stack.toString();var getCallstack=flags=>{var callstack=jsStackTrace();var lines=callstack.split("\\n");callstack="";var firefoxRe=new RegExp("\\\\s*(.*?)@(.*?):([0-9]+):([0-9]+)");var chromeRe=new RegExp("\\\\s*at (.*?) \\\\((.*):(.*):(.*)\\\\)");for(var line of lines){var symbolName="";var file="";var lineno=0;var column=0;var parts=chromeRe.exec(line);if(parts?.length==5){symbolName=parts[1];file=parts[2];lineno=parts[3];column=parts[4]}else{parts=firefoxRe.exec(line);if(parts?.length>=4){symbolName=parts[1];file=parts[2];lineno=parts[3];column=parts[4]|0}else{callstack+=line+"\\n";continue}}if(symbolName=="_emscripten_log"||symbolName=="_emscripten_get_callstack"){callstack="";continue}if(flags&24){if(flags&64){file=file.substring(file.replace(/\\\\/g,"/").lastIndexOf("/")+1)}callstack+=`    at ${symbolName} (${file}:${lineno}:${column})\\n`}}callstack=callstack.replace(/\\s+$/,"");return callstack};function _emscripten_get_callstack(flags,str,maxbytes){str=bigintToI53Checked(str);var callstack=getCallstack(flags);if(!str||maxbytes<=0){return lengthBytesUTF8(callstack)+1}var bytesWrittenExcludingNull=stringToUTF8(callstack,str,maxbytes);return bytesWrittenExcludingNull+1}var getHeapMax=()=>17179869184;var _emscripten_get_heap_max=()=>BigInt(getHeapMax());var _emscripten_has_asyncify=()=>2;var _emscripten_num_logical_cores=()=>ENVIRONMENT_IS_NODE?require("os").cpus().length:navigator["hardwareConcurrency"];var growMemory=size=>{var oldHeapSize=wasmMemory.buffer.byteLength;var pages=(size-oldHeapSize+65535)/65536|0;try{wasmMemory.grow(BigInt(pages));updateMemoryViews();return 1}catch(e){}};function _emscripten_resize_heap(requestedSize){requestedSize=bigintToI53Checked(requestedSize);var oldSize=(growMemViews(),HEAPU8).length;if(requestedSize<=oldSize){return false}var maxHeapSize=getHeapMax();if(requestedSize>maxHeapSize){return false}for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignMemory(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=growMemory(newSize);if(replacement){return true}}return false}var stringToUTF8OnStack=str=>{var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8(str,ret,size);return ret};var writeI53ToI64=(ptr,num)=>{(growMemViews(),HEAPU32)[ptr/4]=num;var lower=(growMemViews(),HEAPU32)[ptr/4];(growMemViews(),HEAPU32)[(ptr+4)/4]=(num-lower)/4294967296};var stringToNewUTF8=str=>{var size=lengthBytesUTF8(str)+1;var ret=_malloc(size);if(ret)stringToUTF8(str,ret,size);return ret};var readI53FromI64=ptr=>(growMemViews(),HEAPU32)[ptr/4]+(growMemViews(),HEAP32)[(ptr+4)/4]*4294967296;var WebGPU={Internals:{jsObjects:[],jsObjectInsert:(ptr,jsObject)=>{WebGPU.Internals.jsObjects[ptr]=jsObject},bufferOnUnmaps:[],futures:[],futureInsert:(futureId,promise)=>{WebGPU.Internals.futures[futureId]=new Promise(resolve=>promise.finally(()=>resolve(futureId)))}},getJsObject:ptr=>{if(!ptr)return undefined;return WebGPU.Internals.jsObjects[ptr]},importJsAdapter:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateAdapter(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsBindGroup:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateBindGroup(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsBindGroupLayout:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateBindGroupLayout(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsBuffer:(buffer,parentPtr=0)=>{assert(buffer.mapState==="unmapped");var bufferPtr=_emwgpuCreateBuffer(parentPtr);WebGPU.Internals.jsObjectInsert(bufferPtr,buffer);return bufferPtr},importJsCommandBuffer:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateCommandBuffer(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsCommandEncoder:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateCommandEncoder(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsComputePassEncoder:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateComputePassEncoder(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsComputePipeline:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateComputePipeline(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsDevice:(device,parentPtr=0)=>{var queuePtr=_emwgpuCreateQueue(parentPtr);var devicePtr=_emwgpuCreateDevice(parentPtr,queuePtr);WebGPU.Internals.jsObjectInsert(queuePtr,device.queue);WebGPU.Internals.jsObjectInsert(devicePtr,device);return devicePtr},importJsExternalTexture:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateExternalTexture(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsPipelineLayout:(obj,parentPtr=0)=>{var ptr=_emwgpuCreatePipelineLayout(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsQuerySet:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateQuerySet(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsQueue:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateQueue(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsRenderBundle:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateRenderBundle(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsRenderBundleEncoder:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateRenderBundleEncoder(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsRenderPassEncoder:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateRenderPassEncoder(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsRenderPipeline:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateRenderPipeline(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsSampler:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateSampler(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsShaderModule:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateShaderModule(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsSurface:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateSurface(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsTexture:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateTexture(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},importJsTextureView:(obj,parentPtr=0)=>{var ptr=_emwgpuCreateTextureView(parentPtr);WebGPU.Internals.jsObjects[ptr]=obj;return ptr},errorCallback:(callback,type,message,userdata)=>{var sp=stackSave();var messagePtr=stringToUTF8OnStack(message);((a1,a2,a3)=>getWasmTableEntry(callback).call(null,a1,BigInt(a2),BigInt(a3)))(type,BigInt(messagePtr),userdata);stackRestore(sp)},iterateExtensions:(root,handlers)=>{for(var ptr=Number((growMemViews(),HEAPU64)[root/8]);ptr;ptr=Number((growMemViews(),HEAPU64)[ptr/8])){var sType=(growMemViews(),HEAP32)[(ptr+8)/4];var handler=handlers[sType](ptr)}},setStringView:(ptr,data,length)=>{(growMemViews(),HEAPU64)[ptr/8]=BigInt(data);(growMemViews(),HEAPU64)[(ptr+8)/8]=BigInt(length)},makeStringFromStringView:stringViewPtr=>{var ptr=Number((growMemViews(),HEAPU64)[stringViewPtr/8]);var length=Number((growMemViews(),HEAPU64)[(stringViewPtr+8)/8]);return UTF8ToString(ptr,length)},makeStringFromOptionalStringView:stringViewPtr=>{var ptr=Number((growMemViews(),HEAPU64)[stringViewPtr/8]);var length=Number((growMemViews(),HEAPU64)[(stringViewPtr+8)/8]);if(!ptr){if(length===0){return""}return undefined}return UTF8ToString(ptr,length)},makeColor:ptr=>({r:(growMemViews(),HEAPF64)[ptr/8],g:(growMemViews(),HEAPF64)[(ptr+8)/8],b:(growMemViews(),HEAPF64)[(ptr+16)/8],a:(growMemViews(),HEAPF64)[(ptr+24)/8]}),makeExtent3D:ptr=>({width:(growMemViews(),HEAPU32)[ptr/4],height:(growMemViews(),HEAPU32)[(ptr+4)/4],depthOrArrayLayers:(growMemViews(),HEAPU32)[(ptr+8)/4]}),makeOrigin3D:ptr=>({x:(growMemViews(),HEAPU32)[ptr/4],y:(growMemViews(),HEAPU32)[(ptr+4)/4],z:(growMemViews(),HEAPU32)[(ptr+8)/4]}),makeTexelCopyTextureInfo:ptr=>({texture:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[ptr/8])),mipLevel:(growMemViews(),HEAPU32)[(ptr+8)/4],origin:WebGPU.makeOrigin3D(ptr+12),aspect:WebGPU.TextureAspect[(growMemViews(),HEAP32)[(ptr+24)/4]]}),makeTexelCopyBufferLayout:ptr=>{var bytesPerRow=(growMemViews(),HEAPU32)[(ptr+8)/4];var rowsPerImage=(growMemViews(),HEAPU32)[(ptr+12)/4];return{offset:readI53FromI64(ptr),bytesPerRow:bytesPerRow===4294967295?undefined:bytesPerRow,rowsPerImage:rowsPerImage===4294967295?undefined:rowsPerImage}},makeTexelCopyBufferInfo:ptr=>{var layoutPtr=ptr+0;var bufferCopyView=WebGPU.makeTexelCopyBufferLayout(layoutPtr);bufferCopyView["buffer"]=WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(ptr+16)/8]));return bufferCopyView},makePassTimestampWrites:ptr=>{if(ptr===0)return undefined;return{querySet:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(ptr+8)/8])),beginningOfPassWriteIndex:(growMemViews(),HEAPU32)[(ptr+16)/4],endOfPassWriteIndex:(growMemViews(),HEAPU32)[(ptr+20)/4]}},makePipelineConstants:(constantCount,constantsPtr)=>{if(!constantCount)return;var constants={};for(var i=0;i<constantCount;++i){var entryPtr=constantsPtr+32*i;var key=WebGPU.makeStringFromStringView(entryPtr+8);constants[key]=(growMemViews(),HEAPF64)[(entryPtr+24)/8]}return constants},makePipelineLayout:layoutPtr=>{if(!layoutPtr)return"auto";return WebGPU.getJsObject(layoutPtr)},makeComputeState:ptr=>{if(!ptr)return undefined;var desc={module:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(ptr+8)/8])),constants:WebGPU.makePipelineConstants(Number((growMemViews(),HEAPU64)[(ptr+32)/8]),Number((growMemViews(),HEAPU64)[(ptr+40)/8])),entryPoint:WebGPU.makeStringFromOptionalStringView(ptr+16)};return desc},makeComputePipelineDesc:descriptor=>{var desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),layout:WebGPU.makePipelineLayout(Number((growMemViews(),HEAPU64)[(descriptor+24)/8])),compute:WebGPU.makeComputeState(descriptor+32)};return desc},makeRenderPipelineDesc:descriptor=>{function makePrimitiveState(psPtr){if(!psPtr)return undefined;return{topology:WebGPU.PrimitiveTopology[(growMemViews(),HEAP32)[(psPtr+8)/4]],stripIndexFormat:WebGPU.IndexFormat[(growMemViews(),HEAP32)[(psPtr+12)/4]],frontFace:WebGPU.FrontFace[(growMemViews(),HEAP32)[(psPtr+16)/4]],cullMode:WebGPU.CullMode[(growMemViews(),HEAP32)[(psPtr+20)/4]],unclippedDepth:!!(growMemViews(),HEAPU32)[(psPtr+24)/4]}}function makeBlendComponent(bdPtr){if(!bdPtr)return undefined;return{operation:WebGPU.BlendOperation[(growMemViews(),HEAP32)[bdPtr/4]],srcFactor:WebGPU.BlendFactor[(growMemViews(),HEAP32)[(bdPtr+4)/4]],dstFactor:WebGPU.BlendFactor[(growMemViews(),HEAP32)[(bdPtr+8)/4]]}}function makeBlendState(bsPtr){if(!bsPtr)return undefined;return{alpha:makeBlendComponent(bsPtr+12),color:makeBlendComponent(bsPtr+0)}}function makeColorState(csPtr){var format=WebGPU.TextureFormat[(growMemViews(),HEAP32)[(csPtr+8)/4]];return format?{format,blend:makeBlendState(Number((growMemViews(),HEAPU64)[(csPtr+16)/8])),writeMask:(growMemViews(),HEAPU32)[(csPtr+24)/4]}:undefined}function makeColorStates(count,csArrayPtr){var states=[];for(var i=0;i<count;++i){states.push(makeColorState(csArrayPtr+32*i))}return states}function makeStencilStateFace(ssfPtr){return{compare:WebGPU.CompareFunction[(growMemViews(),HEAP32)[ssfPtr/4]],failOp:WebGPU.StencilOperation[(growMemViews(),HEAP32)[(ssfPtr+4)/4]],depthFailOp:WebGPU.StencilOperation[(growMemViews(),HEAP32)[(ssfPtr+8)/4]],passOp:WebGPU.StencilOperation[(growMemViews(),HEAP32)[(ssfPtr+12)/4]]}}function makeDepthStencilState(dssPtr){if(!dssPtr)return undefined;return{format:WebGPU.TextureFormat[(growMemViews(),HEAP32)[(dssPtr+8)/4]],depthWriteEnabled:!!(growMemViews(),HEAPU32)[(dssPtr+12)/4],depthCompare:WebGPU.CompareFunction[(growMemViews(),HEAP32)[(dssPtr+16)/4]],stencilFront:makeStencilStateFace(dssPtr+20),stencilBack:makeStencilStateFace(dssPtr+36),stencilReadMask:(growMemViews(),HEAPU32)[(dssPtr+52)/4],stencilWriteMask:(growMemViews(),HEAPU32)[(dssPtr+56)/4],depthBias:(growMemViews(),HEAP32)[(dssPtr+60)/4],depthBiasSlopeScale:(growMemViews(),HEAPF32)[(dssPtr+64)/4],depthBiasClamp:(growMemViews(),HEAPF32)[(dssPtr+68)/4]}}function makeVertexAttribute(vaPtr){return{format:WebGPU.VertexFormat[(growMemViews(),HEAP32)[(vaPtr+8)/4]],offset:readI53FromI64(vaPtr+16),shaderLocation:(growMemViews(),HEAPU32)[(vaPtr+24)/4]}}function makeVertexAttributes(count,vaArrayPtr){var vas=[];for(var i=0;i<count;++i){vas.push(makeVertexAttribute(vaArrayPtr+i*32))}return vas}function makeVertexBuffer(vbPtr){if(!vbPtr)return undefined;var stepMode=WebGPU.VertexStepMode[(growMemViews(),HEAP32)[(vbPtr+8)/4]];var attributeCount=Number((growMemViews(),HEAPU64)[(vbPtr+24)/8]);if(!stepMode&&!attributeCount){return null}return{arrayStride:readI53FromI64(vbPtr+16),stepMode,attributes:makeVertexAttributes(attributeCount,Number((growMemViews(),HEAPU64)[(vbPtr+32)/8]))}}function makeVertexBuffers(count,vbArrayPtr){if(!count)return undefined;var vbs=[];for(var i=0;i<count;++i){vbs.push(makeVertexBuffer(vbArrayPtr+i*40))}return vbs}function makeVertexState(viPtr){if(!viPtr)return undefined;var desc={module:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(viPtr+8)/8])),constants:WebGPU.makePipelineConstants(Number((growMemViews(),HEAPU64)[(viPtr+32)/8]),Number((growMemViews(),HEAPU64)[(viPtr+40)/8])),buffers:makeVertexBuffers(Number((growMemViews(),HEAPU64)[(viPtr+48)/8]),Number((growMemViews(),HEAPU64)[(viPtr+56)/8])),entryPoint:WebGPU.makeStringFromOptionalStringView(viPtr+16)};return desc}function makeMultisampleState(msPtr){if(!msPtr)return undefined;return{count:(growMemViews(),HEAPU32)[(msPtr+8)/4],mask:(growMemViews(),HEAPU32)[(msPtr+12)/4],alphaToCoverageEnabled:!!(growMemViews(),HEAPU32)[(msPtr+16)/4]}}function makeFragmentState(fsPtr){if(!fsPtr)return undefined;var desc={module:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(fsPtr+8)/8])),constants:WebGPU.makePipelineConstants(Number((growMemViews(),HEAPU64)[(fsPtr+32)/8]),Number((growMemViews(),HEAPU64)[(fsPtr+40)/8])),targets:makeColorStates(Number((growMemViews(),HEAPU64)[(fsPtr+48)/8]),Number((growMemViews(),HEAPU64)[(fsPtr+56)/8])),entryPoint:WebGPU.makeStringFromOptionalStringView(fsPtr+16)};return desc}var desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),layout:WebGPU.makePipelineLayout(Number((growMemViews(),HEAPU64)[(descriptor+24)/8])),vertex:makeVertexState(descriptor+32),primitive:makePrimitiveState(descriptor+96),depthStencil:makeDepthStencilState(Number((growMemViews(),HEAPU64)[(descriptor+128)/8])),multisample:makeMultisampleState(descriptor+136),fragment:makeFragmentState(Number((growMemViews(),HEAPU64)[(descriptor+160)/8]))};return desc},fillLimitStruct:(limits,limitsOutPtr)=>{var nextInChainPtr=Number((growMemViews(),HEAPU64)[limitsOutPtr/8]);function setLimitValueU32(name,basePtr,limitOffset,fallbackValue=0){var limitValue=limits[name]??fallbackValue;(growMemViews(),HEAPU32)[(basePtr+limitOffset)/4]=limitValue}function setLimitValueU64(name,basePtr,limitOffset,fallbackValue=0){var limitValue=limits[name]??fallbackValue;writeI53ToI64(basePtr+limitOffset,limitValue)}setLimitValueU32("maxTextureDimension1D",limitsOutPtr,8);setLimitValueU32("maxTextureDimension2D",limitsOutPtr,12);setLimitValueU32("maxTextureDimension3D",limitsOutPtr,16);setLimitValueU32("maxTextureArrayLayers",limitsOutPtr,20);setLimitValueU32("maxBindGroups",limitsOutPtr,24);setLimitValueU32("maxBindGroupsPlusVertexBuffers",limitsOutPtr,28);setLimitValueU32("maxBindingsPerBindGroup",limitsOutPtr,32);setLimitValueU32("maxDynamicUniformBuffersPerPipelineLayout",limitsOutPtr,36);setLimitValueU32("maxDynamicStorageBuffersPerPipelineLayout",limitsOutPtr,40);setLimitValueU32("maxSampledTexturesPerShaderStage",limitsOutPtr,44);setLimitValueU32("maxSamplersPerShaderStage",limitsOutPtr,48);setLimitValueU32("maxStorageBuffersPerShaderStage",limitsOutPtr,52);setLimitValueU32("maxStorageTexturesPerShaderStage",limitsOutPtr,56);setLimitValueU32("maxUniformBuffersPerShaderStage",limitsOutPtr,60);setLimitValueU32("minUniformBufferOffsetAlignment",limitsOutPtr,80);setLimitValueU32("minStorageBufferOffsetAlignment",limitsOutPtr,84);setLimitValueU64("maxUniformBufferBindingSize",limitsOutPtr,64);setLimitValueU64("maxStorageBufferBindingSize",limitsOutPtr,72);setLimitValueU32("maxVertexBuffers",limitsOutPtr,88);setLimitValueU64("maxBufferSize",limitsOutPtr,96);setLimitValueU32("maxVertexAttributes",limitsOutPtr,104);setLimitValueU32("maxVertexBufferArrayStride",limitsOutPtr,108);setLimitValueU32("maxInterStageShaderVariables",limitsOutPtr,112);setLimitValueU32("maxColorAttachments",limitsOutPtr,116);setLimitValueU32("maxColorAttachmentBytesPerSample",limitsOutPtr,120);setLimitValueU32("maxComputeWorkgroupStorageSize",limitsOutPtr,124);setLimitValueU32("maxComputeInvocationsPerWorkgroup",limitsOutPtr,128);setLimitValueU32("maxComputeWorkgroupSizeX",limitsOutPtr,132);setLimitValueU32("maxComputeWorkgroupSizeY",limitsOutPtr,136);setLimitValueU32("maxComputeWorkgroupSizeZ",limitsOutPtr,140);setLimitValueU32("maxComputeWorkgroupsPerDimension",limitsOutPtr,144);setLimitValueU32("maxImmediateSize",limitsOutPtr,148);if(nextInChainPtr!==0){var sType=(growMemViews(),HEAP32)[(nextInChainPtr+8)/4];var compatibilityModeLimitsPtr=nextInChainPtr;setLimitValueU32("maxStorageBuffersInVertexStage",compatibilityModeLimitsPtr,16,limits.maxStorageBuffersPerShaderStage);setLimitValueU32("maxStorageBuffersInFragmentStage",compatibilityModeLimitsPtr,24,limits.maxStorageBuffersPerShaderStage);setLimitValueU32("maxStorageTexturesInVertexStage",compatibilityModeLimitsPtr,20,limits.maxStorageTexturesPerShaderStage);setLimitValueU32("maxStorageTexturesInFragmentStage",compatibilityModeLimitsPtr,28,limits.maxStorageTexturesPerShaderStage)}},fillAdapterInfoStruct:(info,infoStruct)=>{(growMemViews(),HEAPU32)[(infoStruct+88)/4]=info.subgroupMinSize;(growMemViews(),HEAPU32)[(infoStruct+92)/4]=info.subgroupMaxSize;var strs=info.vendor+info.architecture+info.device+info.description;var strPtr=stringToNewUTF8(strs);var vendorLen=lengthBytesUTF8(info.vendor);WebGPU.setStringView(infoStruct+8,strPtr,vendorLen);strPtr+=vendorLen;var architectureLen=lengthBytesUTF8(info.architecture);WebGPU.setStringView(infoStruct+24,strPtr,architectureLen);strPtr+=architectureLen;var deviceLen=lengthBytesUTF8(info.device);WebGPU.setStringView(infoStruct+40,strPtr,deviceLen);strPtr+=deviceLen;var descriptionLen=lengthBytesUTF8(info.description);WebGPU.setStringView(infoStruct+56,strPtr,descriptionLen);strPtr+=descriptionLen;(growMemViews(),HEAP32)[(infoStruct+72)/4]=2;var adapterType=info.isFallbackAdapter?3:4;(growMemViews(),HEAP32)[(infoStruct+76)/4]=adapterType;(growMemViews(),HEAPU32)[(infoStruct+80)/4]=0;(growMemViews(),HEAPU32)[(infoStruct+84)/4]=0},AddressMode:[,"clamp-to-edge","repeat","mirror-repeat"],BlendFactor:[,"zero","one","src","one-minus-src","src-alpha","one-minus-src-alpha","dst","one-minus-dst","dst-alpha","one-minus-dst-alpha","src-alpha-saturated","constant","one-minus-constant","src1","one-minus-src1","src1-alpha","one-minus-src1-alpha"],BlendOperation:[,"add","subtract","reverse-subtract","min","max"],BufferBindingType:[,,"uniform","storage","read-only-storage"],BufferMapState:[,"unmapped","pending","mapped"],CompareFunction:[,"never","less","equal","less-equal","greater","not-equal","greater-equal","always"],CompilationInfoRequestStatus:[,"success","callback-cancelled"],ComponentSwizzle:[,"0","1","r","g","b","a"],CompositeAlphaMode:[,"opaque","premultiplied","unpremultiplied","inherit"],CullMode:[,"none","front","back"],ErrorFilter:[,"validation","out-of-memory","internal"],FeatureLevel:[,"compatibility","core"],FeatureName:{1:"core-features-and-limits",2:"depth-clip-control",3:"depth32float-stencil8",4:"texture-compression-bc",5:"texture-compression-bc-sliced-3d",6:"texture-compression-etc2",7:"texture-compression-astc",8:"texture-compression-astc-sliced-3d",9:"timestamp-query",10:"indirect-first-instance",11:"shader-f16",12:"rg11b10ufloat-renderable",13:"bgra8unorm-storage",14:"float32-filterable",15:"float32-blendable",16:"clip-distances",17:"dual-source-blending",18:"subgroups",19:"texture-formats-tier1",20:"texture-formats-tier2",21:"primitive-index",22:"texture-component-swizzle",327692:"chromium-experimental-unorm16-texture-formats",327729:"chromium-experimental-multi-draw-indirect"},FilterMode:[,"nearest","linear"],FrontFace:[,"ccw","cw"],IndexFormat:[,"uint16","uint32"],InstanceFeatureName:[,"timed-wait-any","shader-source-spirv","multiple-devices-per-adapter"],LoadOp:[,"load","clear"],MipmapFilterMode:[,"nearest","linear"],OptionalBool:["false","true"],PowerPreference:[,"low-power","high-performance"],PredefinedColorSpace:[,"srgb","display-p3"],PrimitiveTopology:[,"point-list","line-list","line-strip","triangle-list","triangle-strip"],QueryType:[,"occlusion","timestamp"],SamplerBindingType:[,,"filtering","non-filtering","comparison"],Status:[,"success","error"],StencilOperation:[,"keep","zero","replace","invert","increment-clamp","decrement-clamp","increment-wrap","decrement-wrap"],StorageTextureAccess:[,,"write-only","read-only","read-write"],StoreOp:[,"store","discard"],SurfaceGetCurrentTextureStatus:[,"success-optimal","success-suboptimal","timeout","outdated","lost","error"],TextureAspect:[,"all","stencil-only","depth-only"],TextureDimension:[,"1d","2d","3d"],TextureFormat:[,"r8unorm","r8snorm","r8uint","r8sint","r16unorm","r16snorm","r16uint","r16sint","r16float","rg8unorm","rg8snorm","rg8uint","rg8sint","r32float","r32uint","r32sint","rg16unorm","rg16snorm","rg16uint","rg16sint","rg16float","rgba8unorm","rgba8unorm-srgb","rgba8snorm","rgba8uint","rgba8sint","bgra8unorm","bgra8unorm-srgb","rgb10a2uint","rgb10a2unorm","rg11b10ufloat","rgb9e5ufloat","rg32float","rg32uint","rg32sint","rgba16unorm","rgba16snorm","rgba16uint","rgba16sint","rgba16float","rgba32float","rgba32uint","rgba32sint","stencil8","depth16unorm","depth24plus","depth24plus-stencil8","depth32float","depth32float-stencil8","bc1-rgba-unorm","bc1-rgba-unorm-srgb","bc2-rgba-unorm","bc2-rgba-unorm-srgb","bc3-rgba-unorm","bc3-rgba-unorm-srgb","bc4-r-unorm","bc4-r-snorm","bc5-rg-unorm","bc5-rg-snorm","bc6h-rgb-ufloat","bc6h-rgb-float","bc7-rgba-unorm","bc7-rgba-unorm-srgb","etc2-rgb8unorm","etc2-rgb8unorm-srgb","etc2-rgb8a1unorm","etc2-rgb8a1unorm-srgb","etc2-rgba8unorm","etc2-rgba8unorm-srgb","eac-r11unorm","eac-r11snorm","eac-rg11unorm","eac-rg11snorm","astc-4x4-unorm","astc-4x4-unorm-srgb","astc-5x4-unorm","astc-5x4-unorm-srgb","astc-5x5-unorm","astc-5x5-unorm-srgb","astc-6x5-unorm","astc-6x5-unorm-srgb","astc-6x6-unorm","astc-6x6-unorm-srgb","astc-8x5-unorm","astc-8x5-unorm-srgb","astc-8x6-unorm","astc-8x6-unorm-srgb","astc-8x8-unorm","astc-8x8-unorm-srgb","astc-10x5-unorm","astc-10x5-unorm-srgb","astc-10x6-unorm","astc-10x6-unorm-srgb","astc-10x8-unorm","astc-10x8-unorm-srgb","astc-10x10-unorm","astc-10x10-unorm-srgb","astc-12x10-unorm","astc-12x10-unorm-srgb","astc-12x12-unorm","astc-12x12-unorm-srgb"],TextureSampleType:[,,"float","unfilterable-float","depth","sint","uint"],TextureViewDimension:[,"1d","2d","2d-array","cube","cube-array","3d"],ToneMappingMode:[,"standard","extended"],VertexFormat:[,"uint8","uint8x2","uint8x4","sint8","sint8x2","sint8x4","unorm8","unorm8x2","unorm8x4","snorm8","snorm8x2","snorm8x4","uint16","uint16x2","uint16x4","sint16","sint16x2","sint16x4","unorm16","unorm16x2","unorm16x4","snorm16","snorm16x2","snorm16x4","float16","float16x2","float16x4","float32","float32x2","float32x3","float32x4","uint32","uint32x2","uint32x3","uint32x4","sint32","sint32x2","sint32x3","sint32x4","unorm10-10-10-2","unorm8x4-bgra"],VertexStepMode:[,"vertex","instance"],WGSLLanguageFeatureName:[,"readonly_and_readwrite_storage_textures","packed_4x8_integer_dot_product","unrestricted_pointer_parameters","pointer_composite_access","uniform_buffer_standard_layout","subgroup_id","texture_and_sampler_let","subgroup_uniformity","texture_formats_tier1"]};var emwgpuStringToInt_DeviceLostReason={undefined:1,unknown:1,destroyed:2};var runtimeKeepalivePop=()=>{runtimeKeepaliveCounter-=1};function _emwgpuAdapterRequestDevice(adapterPtr,futureId,deviceLostFutureId,devicePtr,queuePtr,descriptor){adapterPtr=bigintToI53Checked(adapterPtr);futureId=bigintToI53Checked(futureId);deviceLostFutureId=bigintToI53Checked(deviceLostFutureId);devicePtr=bigintToI53Checked(devicePtr);queuePtr=bigintToI53Checked(queuePtr);descriptor=bigintToI53Checked(descriptor);var adapter=WebGPU.getJsObject(adapterPtr);var desc={};if(descriptor){var requiredFeatureCount=Number((growMemViews(),HEAPU64)[(descriptor+24)/8]);if(requiredFeatureCount){var requiredFeaturesPtr=Number((growMemViews(),HEAPU64)[(descriptor+32)/8]);desc["requiredFeatures"]=Array.from((growMemViews(),HEAPU32).subarray(requiredFeaturesPtr/4,(requiredFeaturesPtr+requiredFeatureCount*4)/4),feature=>WebGPU.FeatureName[feature])}var limitsPtr=Number((growMemViews(),HEAPU64)[(descriptor+40)/8]);if(limitsPtr){var nextInChainPtr=Number((growMemViews(),HEAPU64)[limitsPtr/8]);var requiredLimits={};function setLimitU32IfDefined(name,basePtr,limitOffset,ignoreIfZero=false){var ptr=basePtr+limitOffset;var value=(growMemViews(),HEAPU32)[ptr/4];if(value!=4294967295&&(!ignoreIfZero||value!=0)){requiredLimits[name]=value}}function setLimitU64IfDefined(name,basePtr,limitOffset){var ptr=basePtr+limitOffset;var limitPart1=(growMemViews(),HEAPU32)[ptr/4];var limitPart2=(growMemViews(),HEAPU32)[(ptr+4)/4];if(limitPart1!=4294967295||limitPart2!=4294967295){requiredLimits[name]=readI53FromI64(ptr)}}setLimitU32IfDefined("maxTextureDimension1D",limitsPtr,8);setLimitU32IfDefined("maxTextureDimension2D",limitsPtr,12);setLimitU32IfDefined("maxTextureDimension3D",limitsPtr,16);setLimitU32IfDefined("maxTextureArrayLayers",limitsPtr,20);setLimitU32IfDefined("maxBindGroups",limitsPtr,24);setLimitU32IfDefined("maxBindGroupsPlusVertexBuffers",limitsPtr,28);setLimitU32IfDefined("maxBindingsPerBindGroup",limitsPtr,32);setLimitU32IfDefined("maxDynamicUniformBuffersPerPipelineLayout",limitsPtr,36);setLimitU32IfDefined("maxDynamicStorageBuffersPerPipelineLayout",limitsPtr,40);setLimitU32IfDefined("maxSampledTexturesPerShaderStage",limitsPtr,44);setLimitU32IfDefined("maxSamplersPerShaderStage",limitsPtr,48);setLimitU32IfDefined("maxStorageBuffersPerShaderStage",limitsPtr,52);setLimitU32IfDefined("maxStorageTexturesPerShaderStage",limitsPtr,56);setLimitU32IfDefined("maxUniformBuffersPerShaderStage",limitsPtr,60);setLimitU32IfDefined("minUniformBufferOffsetAlignment",limitsPtr,80);setLimitU32IfDefined("minStorageBufferOffsetAlignment",limitsPtr,84);setLimitU64IfDefined("maxUniformBufferBindingSize",limitsPtr,64);setLimitU64IfDefined("maxStorageBufferBindingSize",limitsPtr,72);setLimitU32IfDefined("maxVertexBuffers",limitsPtr,88);setLimitU64IfDefined("maxBufferSize",limitsPtr,96);setLimitU32IfDefined("maxVertexAttributes",limitsPtr,104);setLimitU32IfDefined("maxVertexBufferArrayStride",limitsPtr,108);setLimitU32IfDefined("maxInterStageShaderVariables",limitsPtr,112);setLimitU32IfDefined("maxColorAttachments",limitsPtr,116);setLimitU32IfDefined("maxColorAttachmentBytesPerSample",limitsPtr,120);setLimitU32IfDefined("maxComputeWorkgroupStorageSize",limitsPtr,124);setLimitU32IfDefined("maxComputeInvocationsPerWorkgroup",limitsPtr,128);setLimitU32IfDefined("maxComputeWorkgroupSizeX",limitsPtr,132);setLimitU32IfDefined("maxComputeWorkgroupSizeY",limitsPtr,136);setLimitU32IfDefined("maxComputeWorkgroupSizeZ",limitsPtr,140);setLimitU32IfDefined("maxComputeWorkgroupsPerDimension",limitsPtr,144);setLimitU32IfDefined("maxImmediateSize",limitsPtr,148,true);if(nextInChainPtr!==0){var sType=(growMemViews(),HEAP32)[(nextInChainPtr+8)/4];var compatibilityModeLimitsPtr=nextInChainPtr;if("maxStorageBuffersInVertexStage"in GPUSupportedLimits.prototype){setLimitU32IfDefined("maxStorageBuffersInVertexStage",compatibilityModeLimitsPtr,16);setLimitU32IfDefined("maxStorageTexturesInVertexStage",compatibilityModeLimitsPtr,20);setLimitU32IfDefined("maxStorageBuffersInFragmentStage",compatibilityModeLimitsPtr,24);setLimitU32IfDefined("maxStorageTexturesInFragmentStage",compatibilityModeLimitsPtr,28)}}desc["requiredLimits"]=requiredLimits}var defaultQueuePtr=Number((growMemViews(),HEAPU64)[(descriptor+48)/8]);if(defaultQueuePtr){var defaultQueueDesc={label:WebGPU.makeStringFromOptionalStringView(defaultQueuePtr+8)};desc["defaultQueue"]=defaultQueueDesc}desc["label"]=WebGPU.makeStringFromOptionalStringView(descriptor+8)}runtimeKeepalivePush();WebGPU.Internals.futureInsert(futureId,adapter.requestDevice(desc).then(device=>{runtimeKeepalivePop();callUserCallback(()=>{WebGPU.Internals.jsObjectInsert(queuePtr,device.queue);WebGPU.Internals.jsObjectInsert(devicePtr,device);devicePtr=BigInt(devicePtr);WebGPU.Internals.futureInsert(deviceLostFutureId,device.lost.then(info=>{callUserCallback(()=>{device.onuncapturederror=ev=>{};var sp=stackSave();var messagePtr=stringToUTF8OnStack(info.message);_emwgpuOnDeviceLostCompleted(deviceLostFutureId,emwgpuStringToInt_DeviceLostReason[info.reason],BigInt(messagePtr));stackRestore(sp)})}));device.onuncapturederror=ev=>{var type=5;if(ev.error instanceof GPUValidationError)type=2;else if(ev.error instanceof GPUOutOfMemoryError)type=3;else if(ev.error instanceof GPUInternalError)type=4;var sp=stackSave();var messagePtr=stringToUTF8OnStack(ev.error.message);_emwgpuOnUncapturedError(BigInt(devicePtr),type,BigInt(messagePtr));stackRestore(sp)};_emwgpuOnRequestDeviceCompleted(futureId,1,BigInt(devicePtr),0n)})},ex=>{runtimeKeepalivePop();callUserCallback(()=>{var sp=stackSave();var messagePtr=stringToUTF8OnStack(ex.message);_emwgpuOnRequestDeviceCompleted(futureId,3,BigInt(devicePtr),BigInt(messagePtr));if(deviceLostFutureId){_emwgpuOnDeviceLostCompleted(deviceLostFutureId,4,BigInt(messagePtr))}stackRestore(sp)})}))}function _emwgpuBufferDestroy(bufferPtr){bufferPtr=bigintToI53Checked(bufferPtr);var buffer=WebGPU.getJsObject(bufferPtr);var onUnmap=WebGPU.Internals.bufferOnUnmaps[bufferPtr];if(onUnmap){for(var i=0;i<onUnmap.length;++i){onUnmap[i]()}delete WebGPU.Internals.bufferOnUnmaps[bufferPtr]}buffer.destroy()}var warnOnce=text=>{warnOnce.shown||={};if(!warnOnce.shown[text]){warnOnce.shown[text]=1;if(ENVIRONMENT_IS_NODE)text="warning: "+text;err(text)}};var _emwgpuBufferGetConstMappedRange=function(bufferPtr,offset,size){bufferPtr=bigintToI53Checked(bufferPtr);offset=bigintToI53Checked(offset);size=bigintToI53Checked(size);var ret=(()=>{var buffer=WebGPU.getJsObject(bufferPtr);if(size==-1)size=undefined;var mapped;try{mapped=buffer.getMappedRange(offset,size)}catch(ex){return 0n}var data=_memalign(16,mapped.byteLength);(growMemViews(),HEAPU8).set(new Uint8Array(mapped),data);WebGPU.Internals.bufferOnUnmaps[bufferPtr].push(()=>_free(data));return data})();return BigInt(ret)};var _emwgpuBufferMapAsync=function(bufferPtr,futureId,mode,offset,size){bufferPtr=bigintToI53Checked(bufferPtr);futureId=bigintToI53Checked(futureId);mode=bigintToI53Checked(mode);offset=bigintToI53Checked(offset);size=bigintToI53Checked(size);var buffer=WebGPU.getJsObject(bufferPtr);WebGPU.Internals.bufferOnUnmaps[bufferPtr]=[];if(size==-1)size=undefined;runtimeKeepalivePush();WebGPU.Internals.futureInsert(futureId,buffer.mapAsync(mode,offset,size).then(()=>{runtimeKeepalivePop();callUserCallback(()=>{_emwgpuOnMapAsyncCompleted(futureId,1,0n)})},ex=>{runtimeKeepalivePop();callUserCallback(()=>{var sp=stackSave();var messagePtr=stringToUTF8OnStack(ex.message);var status=ex.name==="AbortError"?4:ex.name==="OperationError"?3:0;_emwgpuOnMapAsyncCompleted(futureId,status,BigInt(messagePtr));delete WebGPU.Internals.bufferOnUnmaps[bufferPtr]})}))};function _emwgpuBufferUnmap(bufferPtr){bufferPtr=bigintToI53Checked(bufferPtr);var buffer=WebGPU.getJsObject(bufferPtr);var onUnmap=WebGPU.Internals.bufferOnUnmaps[bufferPtr];if(!onUnmap){return}for(var i=0;i<onUnmap.length;++i){onUnmap[i]()}delete WebGPU.Internals.bufferOnUnmaps[bufferPtr];buffer.unmap()}function _emwgpuDelete(ptr){ptr=bigintToI53Checked(ptr);delete WebGPU.Internals.jsObjects[ptr]}function _emwgpuDeviceCreateBuffer(devicePtr,descriptor,bufferPtr){devicePtr=bigintToI53Checked(devicePtr);descriptor=bigintToI53Checked(descriptor);bufferPtr=bigintToI53Checked(bufferPtr);var mappedAtCreation=!!(growMemViews(),HEAPU32)[(descriptor+40)/4];var desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),usage:(growMemViews(),HEAPU32)[(descriptor+24)/4],size:readI53FromI64(descriptor+32),mappedAtCreation};var device=WebGPU.getJsObject(devicePtr);var buffer;try{buffer=device.createBuffer(desc)}catch(ex){return false}WebGPU.Internals.jsObjectInsert(bufferPtr,buffer);if(mappedAtCreation){WebGPU.Internals.bufferOnUnmaps[bufferPtr]=[]}return true}function _emwgpuDeviceCreateShaderModule(devicePtr,descriptor,shaderModulePtr){devicePtr=bigintToI53Checked(devicePtr);descriptor=bigintToI53Checked(descriptor);shaderModulePtr=bigintToI53Checked(shaderModulePtr);var nextInChainPtr=Number((growMemViews(),HEAPU64)[descriptor/8]);var sType=(growMemViews(),HEAP32)[(nextInChainPtr+8)/4];var desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),code:""};switch(sType){case 2:{desc["code"]=WebGPU.makeStringFromStringView(nextInChainPtr+16);break}}var device=WebGPU.getJsObject(devicePtr);WebGPU.Internals.jsObjectInsert(shaderModulePtr,device.createShaderModule(desc))}var _emwgpuDeviceDestroy=devicePtr=>{const device=WebGPU.getJsObject(devicePtr);device.onuncapturederror=null;device.destroy()};function _emwgpuInstanceRequestAdapter(instancePtr,futureId,options,adapterPtr){instancePtr=bigintToI53Checked(instancePtr);futureId=bigintToI53Checked(futureId);options=bigintToI53Checked(options);adapterPtr=bigintToI53Checked(adapterPtr);var opts;if(options){opts={featureLevel:WebGPU.FeatureLevel[(growMemViews(),HEAP32)[(options+8)/4]],powerPreference:WebGPU.PowerPreference[(growMemViews(),HEAP32)[(options+12)/4]],forceFallbackAdapter:!!(growMemViews(),HEAPU32)[(options+16)/4]};var nextInChainPtr=Number((growMemViews(),HEAPU64)[options/8]);if(nextInChainPtr!==0){var sType=(growMemViews(),HEAP32)[(nextInChainPtr+8)/4];var webxrOptions=nextInChainPtr;opts.xrCompatible=!!(growMemViews(),HEAPU32)[(webxrOptions+16)/4]}}if(!("gpu"in navigator)){var sp=stackSave();var messagePtr=stringToUTF8OnStack("WebGPU not available on this browser (navigator.gpu is not available)");_emwgpuOnRequestAdapterCompleted(futureId,3,BigInt(adapterPtr),BigInt(messagePtr));stackRestore(sp);return}runtimeKeepalivePush();WebGPU.Internals.futureInsert(futureId,navigator.gpu.requestAdapter(opts).then(adapter=>{runtimeKeepalivePop();callUserCallback(()=>{if(adapter){WebGPU.Internals.jsObjectInsert(adapterPtr,adapter);_emwgpuOnRequestAdapterCompleted(futureId,1,BigInt(adapterPtr),0n)}else{var sp=stackSave();var messagePtr=stringToUTF8OnStack("WebGPU not available on this browser (requestAdapter returned null)");_emwgpuOnRequestAdapterCompleted(futureId,3,BigInt(adapterPtr),BigInt(messagePtr));stackRestore(sp)}})},ex=>{runtimeKeepalivePop();callUserCallback(()=>{var sp=stackSave();var messagePtr=stringToUTF8OnStack(ex.message);_emwgpuOnRequestAdapterCompleted(futureId,4,BigInt(adapterPtr),BigInt(messagePtr));stackRestore(sp)})}))}var _emwgpuQueueOnSubmittedWorkDone=function(queuePtr,futureId){queuePtr=bigintToI53Checked(queuePtr);futureId=bigintToI53Checked(futureId);var queue=WebGPU.getJsObject(queuePtr);runtimeKeepalivePush();WebGPU.Internals.futureInsert(futureId,queue.onSubmittedWorkDone().then(()=>{runtimeKeepalivePop();callUserCallback(()=>{_emwgpuOnWorkDoneCompleted(futureId,1)})}))};var _emwgpuWaitAny=function(futurePtr,futureCount,timeoutMSPtr){futurePtr=bigintToI53Checked(futurePtr);futureCount=bigintToI53Checked(futureCount);timeoutMSPtr=bigintToI53Checked(timeoutMSPtr);return Asyncify.handleAsync(async()=>{var promises=[];if(timeoutMSPtr){var timeoutMS=(growMemViews(),HEAP32)[timeoutMSPtr/4];promises.length=futureCount+1;promises[futureCount]=new Promise(resolve=>setTimeout(resolve,timeoutMS,0))}else{promises.length=futureCount}for(var i=0;i<futureCount;++i){var futureId=readI53FromI64(futurePtr+i*8);if(!(futureId in WebGPU.Internals.futures)){return futureId}promises[i]=WebGPU.Internals.futures[futureId]}const firstResolvedFuture=await Promise.race(promises);delete WebGPU.Internals.futures[firstResolvedFuture];return firstResolvedFuture})};_emwgpuWaitAny.isAsync=true;var ENV={};var getExecutableName=()=>thisProgram||"./this.program";var getEnvStrings=()=>{if(!getEnvStrings.strings){var lang=(typeof navigator=="object"&&navigator.language||"C").replace("-","_")+".UTF-8";var env={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:lang,_:getExecutableName()};for(var x in ENV){if(ENV[x]===undefined)delete env[x];else env[x]=ENV[x]}var strings=[];for(var x in env){strings.push(`${x}=${env[x]}`)}getEnvStrings.strings=strings}return getEnvStrings.strings};function _environ_get(__environ,environ_buf){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(14,0,1,__environ,environ_buf);__environ=bigintToI53Checked(__environ);environ_buf=bigintToI53Checked(environ_buf);var bufSize=0;var envp=0;for(var string of getEnvStrings()){var ptr=environ_buf+bufSize;(growMemViews(),HEAPU64)[(__environ+envp)/8]=BigInt(ptr);bufSize+=stringToUTF8(string,ptr,Infinity)+1;envp+=8}return 0}function _environ_sizes_get(penviron_count,penviron_buf_size){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(15,0,1,penviron_count,penviron_buf_size);penviron_count=bigintToI53Checked(penviron_count);penviron_buf_size=bigintToI53Checked(penviron_buf_size);var strings=getEnvStrings();(growMemViews(),HEAPU64)[penviron_count/8]=BigInt(strings.length);var bufSize=0;for(var string of strings){bufSize+=lengthBytesUTF8(string)+1}(growMemViews(),HEAPU64)[penviron_buf_size/8]=BigInt(bufSize);return 0}function _fd_close(fd){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(16,0,1,fd);try{var stream=SYSCALLS.getStreamFromFD(fd);FS.close(stream);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}var doReadv=(stream,iov,iovcnt,offset)=>{var ret=0;for(var i=0;i<iovcnt;i++){var ptr=Number((growMemViews(),HEAPU64)[iov/8]);var len=Number((growMemViews(),HEAPU64)[(iov+8)/8]);iov+=16;var curr=FS.read(stream,(growMemViews(),HEAP8),ptr,len,offset);if(curr<0)return-1;ret+=curr;if(curr<len)break;if(typeof offset!="undefined"){offset+=curr}}return ret};function _fd_read(fd,iov,iovcnt,pnum){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(17,0,1,fd,iov,iovcnt,pnum);iov=bigintToI53Checked(iov);iovcnt=bigintToI53Checked(iovcnt);pnum=bigintToI53Checked(pnum);try{var stream=SYSCALLS.getStreamFromFD(fd);var num=doReadv(stream,iov,iovcnt);(growMemViews(),HEAPU64)[pnum/8]=BigInt(num);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}function _fd_seek(fd,offset,whence,newOffset){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(18,0,1,fd,offset,whence,newOffset);offset=bigintToI53Checked(offset);newOffset=bigintToI53Checked(newOffset);try{if(isNaN(offset))return 61;var stream=SYSCALLS.getStreamFromFD(fd);FS.llseek(stream,offset,whence);(growMemViews(),HEAP64)[newOffset/8]=BigInt(stream.position);if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}var doWritev=(stream,iov,iovcnt,offset)=>{var ret=0;for(var i=0;i<iovcnt;i++){var ptr=Number((growMemViews(),HEAPU64)[iov/8]);var len=Number((growMemViews(),HEAPU64)[(iov+8)/8]);iov+=16;var curr=FS.write(stream,(growMemViews(),HEAP8),ptr,len,offset);if(curr<0)return-1;ret+=curr;if(curr<len){break}if(typeof offset!="undefined"){offset+=curr}}return ret};function _fd_write(fd,iov,iovcnt,pnum){if(ENVIRONMENT_IS_PTHREAD)return proxyToMainThread(19,0,1,fd,iov,iovcnt,pnum);iov=bigintToI53Checked(iov);iovcnt=bigintToI53Checked(iovcnt);pnum=bigintToI53Checked(pnum);try{var stream=SYSCALLS.getStreamFromFD(fd);var num=doWritev(stream,iov,iovcnt);(growMemViews(),HEAPU64)[pnum/8]=BigInt(num);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}function _random_get(buffer,size){buffer=bigintToI53Checked(buffer);size=bigintToI53Checked(size);try{randomFill((growMemViews(),HEAPU8).subarray(buffer,buffer+size));return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}function _wgpuAdapterGetInfo(adapterPtr,info){adapterPtr=bigintToI53Checked(adapterPtr);info=bigintToI53Checked(info);var adapter=WebGPU.getJsObject(adapterPtr);WebGPU.fillAdapterInfoStruct(adapter.info,info);return 1}function _wgpuAdapterGetLimits(adapterPtr,limitsOutPtr){adapterPtr=bigintToI53Checked(adapterPtr);limitsOutPtr=bigintToI53Checked(limitsOutPtr);var adapter=WebGPU.getJsObject(adapterPtr);WebGPU.fillLimitStruct(adapter.limits,limitsOutPtr);return 1}function _wgpuAdapterHasFeature(adapterPtr,featureEnumValue){adapterPtr=bigintToI53Checked(adapterPtr);var adapter=WebGPU.getJsObject(adapterPtr);return adapter.features.has(WebGPU.FeatureName[featureEnumValue])}var _wgpuBufferGetSize=function(bufferPtr){bufferPtr=bigintToI53Checked(bufferPtr);var ret=(()=>{var buffer=WebGPU.getJsObject(bufferPtr);return buffer.size})();return BigInt(ret)};var _wgpuCommandEncoderBeginComputePass=function(encoderPtr,descriptor){encoderPtr=bigintToI53Checked(encoderPtr);descriptor=bigintToI53Checked(descriptor);var ret=(()=>{var desc;if(descriptor){desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),timestampWrites:WebGPU.makePassTimestampWrites(Number((growMemViews(),HEAPU64)[(descriptor+24)/8]))}}var commandEncoder=WebGPU.getJsObject(encoderPtr);var ptr=_emwgpuCreateComputePassEncoder(0n);WebGPU.Internals.jsObjectInsert(ptr,commandEncoder.beginComputePass(desc));return ptr})();return BigInt(ret)};function _wgpuCommandEncoderCopyBufferToBuffer(encoderPtr,srcPtr,srcOffset,dstPtr,dstOffset,size){encoderPtr=bigintToI53Checked(encoderPtr);srcPtr=bigintToI53Checked(srcPtr);srcOffset=bigintToI53Checked(srcOffset);dstPtr=bigintToI53Checked(dstPtr);dstOffset=bigintToI53Checked(dstOffset);size=bigintToI53Checked(size);var commandEncoder=WebGPU.getJsObject(encoderPtr);var src=WebGPU.getJsObject(srcPtr);var dst=WebGPU.getJsObject(dstPtr);commandEncoder.copyBufferToBuffer(src,srcOffset,dst,dstOffset,size)}var _wgpuCommandEncoderFinish=function(encoderPtr,descriptor){encoderPtr=bigintToI53Checked(encoderPtr);descriptor=bigintToI53Checked(descriptor);var ret=(()=>{var commandEncoder=WebGPU.getJsObject(encoderPtr);var ptr=_emwgpuCreateCommandBuffer(0n);WebGPU.Internals.jsObjectInsert(ptr,commandEncoder.finish());return ptr})();return BigInt(ret)};function _wgpuComputePassEncoderDispatchWorkgroups(passPtr,x,y,z){passPtr=bigintToI53Checked(passPtr);var pass=WebGPU.getJsObject(passPtr);pass.dispatchWorkgroups(x,y,z)}function _wgpuComputePassEncoderEnd(passPtr){passPtr=bigintToI53Checked(passPtr);var pass=WebGPU.getJsObject(passPtr);pass.end()}function _wgpuComputePassEncoderSetBindGroup(passPtr,groupIndex,groupPtr,dynamicOffsetCount,dynamicOffsetsPtr){passPtr=bigintToI53Checked(passPtr);groupPtr=bigintToI53Checked(groupPtr);dynamicOffsetCount=bigintToI53Checked(dynamicOffsetCount);dynamicOffsetsPtr=bigintToI53Checked(dynamicOffsetsPtr);var pass=WebGPU.getJsObject(passPtr);var group=WebGPU.getJsObject(groupPtr);if(dynamicOffsetCount==0){pass.setBindGroup(groupIndex,group)}else{pass.setBindGroup(groupIndex,group,(growMemViews(),HEAPU32),dynamicOffsetsPtr/4,dynamicOffsetCount)}}function _wgpuComputePassEncoderSetPipeline(passPtr,pipelinePtr){passPtr=bigintToI53Checked(passPtr);pipelinePtr=bigintToI53Checked(pipelinePtr);var pass=WebGPU.getJsObject(passPtr);var pipeline=WebGPU.getJsObject(pipelinePtr);pass.setPipeline(pipeline)}var _wgpuComputePipelineGetBindGroupLayout=function(pipelinePtr,groupIndex){pipelinePtr=bigintToI53Checked(pipelinePtr);var ret=(()=>{var pipeline=WebGPU.getJsObject(pipelinePtr);var ptr=_emwgpuCreateBindGroupLayout(0n);WebGPU.Internals.jsObjectInsert(ptr,pipeline.getBindGroupLayout(groupIndex));return ptr})();return BigInt(ret)};var _wgpuDeviceCreateBindGroup=function(devicePtr,descriptor){devicePtr=bigintToI53Checked(devicePtr);descriptor=bigintToI53Checked(descriptor);var ret=(()=>{function makeEntry(entryPtr){var bufferPtr=Number((growMemViews(),HEAPU64)[(entryPtr+16)/8]);var samplerPtr=Number((growMemViews(),HEAPU64)[(entryPtr+40)/8]);var textureViewPtr=Number((growMemViews(),HEAPU64)[(entryPtr+48)/8]);var externalTexturePtr=0;WebGPU.iterateExtensions(entryPtr,{327681:ptr=>{externalTexturePtr=Number((growMemViews(),HEAPU64)[(ptr+16)/8])}});var resource;if(bufferPtr){var size=readI53FromI64(entryPtr+32);if(size==-1)size=undefined;resource={buffer:WebGPU.getJsObject(bufferPtr),offset:readI53FromI64(entryPtr+24),size}}else{resource=WebGPU.getJsObject(samplerPtr||textureViewPtr||externalTexturePtr)}return{binding:(growMemViews(),HEAPU32)[(entryPtr+8)/4],resource}}function makeEntries(count,entriesPtrs){var entries=[];for(var i=0;i<count;++i){entries.push(makeEntry(entriesPtrs+56*i))}return entries}var desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8),layout:WebGPU.getJsObject(Number((growMemViews(),HEAPU64)[(descriptor+24)/8])),entries:makeEntries(Number((growMemViews(),HEAPU64)[(descriptor+32)/8]),Number((growMemViews(),HEAPU64)[(descriptor+40)/8]))};var device=WebGPU.getJsObject(devicePtr);var ptr=_emwgpuCreateBindGroup(0n);WebGPU.Internals.jsObjectInsert(ptr,device.createBindGroup(desc));return ptr})();return BigInt(ret)};var _wgpuDeviceCreateCommandEncoder=function(devicePtr,descriptor){devicePtr=bigintToI53Checked(devicePtr);descriptor=bigintToI53Checked(descriptor);var ret=(()=>{var desc;if(descriptor){desc={label:WebGPU.makeStringFromOptionalStringView(descriptor+8)}}var device=WebGPU.getJsObject(devicePtr);var ptr=_emwgpuCreateCommandEncoder(0n);WebGPU.Internals.jsObjectInsert(ptr,device.createCommandEncoder(desc));return ptr})();return BigInt(ret)};var _wgpuDeviceCreateComputePipeline=function(devicePtr,descriptor){devicePtr=bigintToI53Checked(devicePtr);descriptor=bigintToI53Checked(descriptor);var ret=(()=>{var desc=WebGPU.makeComputePipelineDesc(descriptor);var device=WebGPU.getJsObject(devicePtr);var ptr=_emwgpuCreateComputePipeline(0n);WebGPU.Internals.jsObjectInsert(ptr,device.createComputePipeline(desc));return ptr})();return BigInt(ret)};function _wgpuInstanceHasWGSLLanguageFeature(instance,featureEnumValue){instance=bigintToI53Checked(instance);if(!("wgslLanguageFeatures"in navigator.gpu)){return false}return navigator.gpu.wgslLanguageFeatures.has(WebGPU.WGSLLanguageFeatureName[featureEnumValue])}var _wgpuQueueSubmit=function(queuePtr,commandCount,commands){queuePtr=bigintToI53Checked(queuePtr);commandCount=bigintToI53Checked(commandCount);commands=bigintToI53Checked(commands);var queue=WebGPU.getJsObject(queuePtr);var cmds=Array.from((growMemViews(),HEAP64).subarray(commands/8,(commands+commandCount*8)/8),id=>WebGPU.getJsObject(id));queue.submit(cmds)};function _wgpuQueueWriteBuffer(queuePtr,bufferPtr,bufferOffset,data,size){queuePtr=bigintToI53Checked(queuePtr);bufferPtr=bigintToI53Checked(bufferPtr);bufferOffset=bigintToI53Checked(bufferOffset);data=bigintToI53Checked(data);size=bigintToI53Checked(size);var queue=WebGPU.getJsObject(queuePtr);var buffer=WebGPU.getJsObject(bufferPtr);var subarray=(growMemViews(),HEAPU8).subarray(data,data+size);queue.writeBuffer(buffer,bufferOffset,subarray,0,size)}var Asyncify={instrumentWasmImports(imports){var importPattern=/^(invoke_.*|__asyncjs__.*)$/;for(let[x,original]of Object.entries(imports)){if(typeof original=="function"){let isAsyncifyImport=original.isAsync||importPattern.test(x);if(isAsyncifyImport){imports[x]=original=new WebAssembly.Suspending(original)}}}},instrumentFunction(original){var wrapper=(...args)=>original(...args);return wrapper},instrumentWasmExports(exports){var exportPattern=/^(wllama_start|wllama_action|main|__main_argc_argv)$/;Asyncify.asyncExports=new Set;var ret={};for(let[x,original]of Object.entries(exports)){if(typeof original=="function"){let isAsyncifyExport=exportPattern.test(x);if(isAsyncifyExport){Asyncify.asyncExports.add(original);original=Asyncify.makeAsyncFunction(original)}var wrapper=Asyncify.instrumentFunction(original);ret[x]=wrapper}else{ret[x]=original}}return ret},asyncExports:null,isAsyncExport(func){return Asyncify.asyncExports?.has(func)},handleAsync:async startAsync=>{runtimeKeepalivePush();try{return await startAsync()}finally{runtimeKeepalivePop()}},handleSleep:startAsync=>Asyncify.handleAsync(()=>new Promise(startAsync)),makeAsyncFunction(original){return WebAssembly.promising(original)}};var getCFunc=ident=>{var func=Module["_"+ident];return func};var writeArrayToMemory=(array,buffer)=>{(growMemViews(),HEAP8).set(array,buffer)};var ccall=(ident,returnType,argTypes,args,opts)=>{var toC={pointer:p=>BigInt(p),string:str=>{var ret=0;if(str!==null&&str!==undefined&&str!==0){ret=stringToUTF8OnStack(str)}return BigInt(ret)},array:arr=>{var ret=stackAlloc(arr.length);writeArrayToMemory(arr,ret);return BigInt(ret)}};function convertReturnValue(ret){if(returnType==="string"){return UTF8ToString(Number(ret))}if(returnType==="pointer")return Number(ret);if(returnType==="boolean")return Boolean(ret);return ret}var func=getCFunc(ident);var cArgs=[];var stack=0;if(args){for(var i=0;i<args.length;i++){var converter=toC[argTypes[i]];if(converter){if(stack===0)stack=stackSave();cArgs[i]=converter(args[i])}else{cArgs[i]=args[i]}}}var ret=func(...cArgs);function onDone(ret){if(stack!==0)stackRestore(stack);return convertReturnValue(ret)}var asyncMode=opts?.async;if(asyncMode)return ret.then(onDone);ret=onDone(ret);return ret};var cwrap=(ident,returnType,argTypes,opts)=>{var numericArgs=!argTypes||argTypes.every(type=>type==="number"||type==="boolean");var numericRet=returnType!=="string";if(numericRet&&numericArgs&&!opts){return getCFunc(ident)}return(...args)=>ccall(ident,returnType,argTypes,args,opts)};var FS_createPath=(...args)=>FS.createPath(...args);var FS_unlink=(...args)=>FS.unlink(...args);var FS_createLazyFile=(...args)=>FS.createLazyFile(...args);var FS_createDevice=(...args)=>FS.createDevice(...args);PThread.init();FS.createPreloadedFile=FS_createPreloadedFile;FS.preloadFile=FS_preloadFile;FS.staticInit();{initMemory();if(Module["noExitRuntime"])noExitRuntime=Module["noExitRuntime"];if(Module["preloadPlugins"])preloadPlugins=Module["preloadPlugins"];if(Module["print"])out=Module["print"];if(Module["printErr"])err=Module["printErr"];if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];if(Module["arguments"])arguments_=Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].shift()()}}}Module["ENV"]=ENV;Module["mmapAlloc"]=mmapAlloc;Module["wasmMemory"]=wasmMemory;Module["addRunDependency"]=addRunDependency;Module["removeRunDependency"]=removeRunDependency;Module["ccall"]=ccall;Module["cwrap"]=cwrap;Module["FS_preloadFile"]=FS_preloadFile;Module["FS_unlink"]=FS_unlink;Module["FS_createPath"]=FS_createPath;Module["FS_createDevice"]=FS_createDevice;Module["FS"]=FS;Module["FS_createDataFile"]=FS_createDataFile;Module["FS_createLazyFile"]=FS_createLazyFile;Module["MEMFS"]=MEMFS;var proxiedFunctionTable=[_proc_exit,exitOnMainThread,pthreadCreateProxied,___syscall_fcntl64,___syscall_fstat64,___syscall_getcwd,___syscall_getdents64,___syscall_ioctl,___syscall_lstat64,___syscall_newfstatat,___syscall_openat,___syscall_stat64,__mmap_js,__munmap_js,_environ_get,_environ_sizes_get,_fd_close,_fd_read,_fd_seek,_fd_write];function __asyncjs__js_file_read(path_ptr,offset,req_size,out_ptr){return Asyncify.handleAsync(async()=>await _wllama_js_file_read(UTF8ToString(Number(path_ptr)),Number(offset),Number(req_size),Number(out_ptr)))}__asyncjs__js_file_read.sig="jjjjj";var _malloc,_free,_wllama_malloc,_wllama_start,_wllama_action,_wllama_exit,_wllama_debug,_main,_emwgpuCreateBindGroup,_emwgpuCreateBindGroupLayout,_emwgpuCreateCommandBuffer,_emwgpuCreateCommandEncoder,_emwgpuCreateComputePassEncoder,_emwgpuCreateComputePipeline,_emwgpuCreateExternalTexture,_emwgpuCreatePipelineLayout,_emwgpuCreateQuerySet,_emwgpuCreateRenderBundle,_emwgpuCreateRenderBundleEncoder,_emwgpuCreateRenderPassEncoder,_emwgpuCreateRenderPipeline,_emwgpuCreateSampler,_emwgpuCreateSurface,_emwgpuCreateTexture,_emwgpuCreateTextureView,_emwgpuCreateAdapter,_emwgpuCreateBuffer,_emwgpuCreateDevice,_emwgpuCreateQueue,_emwgpuCreateShaderModule,_emwgpuOnDeviceLostCompleted,_emwgpuOnMapAsyncCompleted,_emwgpuOnRequestAdapterCompleted,_emwgpuOnRequestDeviceCompleted,_emwgpuOnWorkDoneCompleted,_emwgpuOnUncapturedError,__emscripten_tls_init,_pthread_self,_emscripten_builtin_memalign,__emscripten_thread_init,__emscripten_thread_crashed,__emscripten_run_js_on_main_thread,__emscripten_thread_free_data,__emscripten_thread_exit,__emscripten_check_mailbox,_memalign,___trap,_emscripten_stack_set_limits,__emscripten_stack_restore,__emscripten_stack_alloc,_emscripten_stack_get_current,__indirect_function_table,wasmTable;function assignWasmExports(wasmExports){_malloc=wasmExports["malloc"];_free=wasmExports["free"];_wllama_malloc=Module["_wllama_malloc"]=wasmExports["wllama_malloc"];_wllama_start=Module["_wllama_start"]=wasmExports["wllama_start"];_wllama_action=Module["_wllama_action"]=wasmExports["wllama_action"];_wllama_exit=Module["_wllama_exit"]=wasmExports["wllama_exit"];_wllama_debug=Module["_wllama_debug"]=wasmExports["wllama_debug"];_main=Module["_main"]=wasmExports["main"];_emwgpuCreateBindGroup=wasmExports["emwgpuCreateBindGroup"];_emwgpuCreateBindGroupLayout=wasmExports["emwgpuCreateBindGroupLayout"];_emwgpuCreateCommandBuffer=wasmExports["emwgpuCreateCommandBuffer"];_emwgpuCreateCommandEncoder=wasmExports["emwgpuCreateCommandEncoder"];_emwgpuCreateComputePassEncoder=wasmExports["emwgpuCreateComputePassEncoder"];_emwgpuCreateComputePipeline=wasmExports["emwgpuCreateComputePipeline"];_emwgpuCreateExternalTexture=wasmExports["emwgpuCreateExternalTexture"];_emwgpuCreatePipelineLayout=wasmExports["emwgpuCreatePipelineLayout"];_emwgpuCreateQuerySet=wasmExports["emwgpuCreateQuerySet"];_emwgpuCreateRenderBundle=wasmExports["emwgpuCreateRenderBundle"];_emwgpuCreateRenderBundleEncoder=wasmExports["emwgpuCreateRenderBundleEncoder"];_emwgpuCreateRenderPassEncoder=wasmExports["emwgpuCreateRenderPassEncoder"];_emwgpuCreateRenderPipeline=wasmExports["emwgpuCreateRenderPipeline"];_emwgpuCreateSampler=wasmExports["emwgpuCreateSampler"];_emwgpuCreateSurface=wasmExports["emwgpuCreateSurface"];_emwgpuCreateTexture=wasmExports["emwgpuCreateTexture"];_emwgpuCreateTextureView=wasmExports["emwgpuCreateTextureView"];_emwgpuCreateAdapter=wasmExports["emwgpuCreateAdapter"];_emwgpuCreateBuffer=wasmExports["emwgpuCreateBuffer"];_emwgpuCreateDevice=wasmExports["emwgpuCreateDevice"];_emwgpuCreateQueue=wasmExports["emwgpuCreateQueue"];_emwgpuCreateShaderModule=wasmExports["emwgpuCreateShaderModule"];_emwgpuOnDeviceLostCompleted=wasmExports["emwgpuOnDeviceLostCompleted"];_emwgpuOnMapAsyncCompleted=wasmExports["emwgpuOnMapAsyncCompleted"];_emwgpuOnRequestAdapterCompleted=wasmExports["emwgpuOnRequestAdapterCompleted"];_emwgpuOnRequestDeviceCompleted=wasmExports["emwgpuOnRequestDeviceCompleted"];_emwgpuOnWorkDoneCompleted=wasmExports["emwgpuOnWorkDoneCompleted"];_emwgpuOnUncapturedError=wasmExports["emwgpuOnUncapturedError"];__emscripten_tls_init=wasmExports["_emscripten_tls_init"];_pthread_self=wasmExports["pthread_self"];_emscripten_builtin_memalign=wasmExports["emscripten_builtin_memalign"];__emscripten_thread_init=wasmExports["_emscripten_thread_init"];__emscripten_thread_crashed=wasmExports["_emscripten_thread_crashed"];__emscripten_run_js_on_main_thread=wasmExports["_emscripten_run_js_on_main_thread"];__emscripten_thread_free_data=wasmExports["_emscripten_thread_free_data"];__emscripten_thread_exit=wasmExports["_emscripten_thread_exit"];__emscripten_check_mailbox=wasmExports["_emscripten_check_mailbox"];_memalign=wasmExports["memalign"];___trap=wasmExports["__trap"];_emscripten_stack_set_limits=wasmExports["emscripten_stack_set_limits"];__emscripten_stack_restore=wasmExports["_emscripten_stack_restore"];__emscripten_stack_alloc=wasmExports["_emscripten_stack_alloc"];_emscripten_stack_get_current=wasmExports["emscripten_stack_get_current"];__indirect_function_table=wasmTable=wasmExports["__indirect_function_table"]}var wasmImports;function assignWasmImports(){wasmImports={__asyncjs__js_file_read,__pthread_create_js:___pthread_create_js,__syscall_fcntl64:___syscall_fcntl64,__syscall_getcwd:___syscall_getcwd,__syscall_getdents64:___syscall_getdents64,__syscall_ioctl:___syscall_ioctl,__syscall_openat:___syscall_openat,__syscall_stat64:___syscall_stat64,_abort_js:__abort_js,_emscripten_init_main_thread_js:__emscripten_init_main_thread_js,_emscripten_notify_mailbox_postmessage:__emscripten_notify_mailbox_postmessage,_emscripten_receive_on_main_thread_js:__emscripten_receive_on_main_thread_js,_emscripten_thread_cleanup:__emscripten_thread_cleanup,_emscripten_thread_mailbox_await:__emscripten_thread_mailbox_await,_emscripten_thread_set_strongref:__emscripten_thread_set_strongref,_localtime_js:__localtime_js,_mmap_js:__mmap_js,_munmap_js:__munmap_js,_tzset_js:__tzset_js,clock_time_get:_clock_time_get,emscripten_check_blocking_allowed:_emscripten_check_blocking_allowed,emscripten_date_now:_emscripten_date_now,emscripten_exit_with_live_runtime:_emscripten_exit_with_live_runtime,emscripten_get_callstack:_emscripten_get_callstack,emscripten_get_heap_max:_emscripten_get_heap_max,emscripten_get_now:_emscripten_get_now,emscripten_has_asyncify:_emscripten_has_asyncify,emscripten_num_logical_cores:_emscripten_num_logical_cores,emscripten_resize_heap:_emscripten_resize_heap,emwgpuAdapterRequestDevice:_emwgpuAdapterRequestDevice,emwgpuBufferDestroy:_emwgpuBufferDestroy,emwgpuBufferGetConstMappedRange:_emwgpuBufferGetConstMappedRange,emwgpuBufferMapAsync:_emwgpuBufferMapAsync,emwgpuBufferUnmap:_emwgpuBufferUnmap,emwgpuDelete:_emwgpuDelete,emwgpuDeviceCreateBuffer:_emwgpuDeviceCreateBuffer,emwgpuDeviceCreateShaderModule:_emwgpuDeviceCreateShaderModule,emwgpuDeviceDestroy:_emwgpuDeviceDestroy,emwgpuInstanceRequestAdapter:_emwgpuInstanceRequestAdapter,emwgpuQueueOnSubmittedWorkDone:_emwgpuQueueOnSubmittedWorkDone,emwgpuWaitAny:_emwgpuWaitAny,environ_get:_environ_get,environ_sizes_get:_environ_sizes_get,exit:_exit,fd_close:_fd_close,fd_read:_fd_read,fd_seek:_fd_seek,fd_write:_fd_write,memory:wasmMemory,random_get:_random_get,wgpuAdapterGetInfo:_wgpuAdapterGetInfo,wgpuAdapterGetLimits:_wgpuAdapterGetLimits,wgpuAdapterHasFeature:_wgpuAdapterHasFeature,wgpuBufferGetSize:_wgpuBufferGetSize,wgpuCommandEncoderBeginComputePass:_wgpuCommandEncoderBeginComputePass,wgpuCommandEncoderCopyBufferToBuffer:_wgpuCommandEncoderCopyBufferToBuffer,wgpuCommandEncoderFinish:_wgpuCommandEncoderFinish,wgpuComputePassEncoderDispatchWorkgroups:_wgpuComputePassEncoderDispatchWorkgroups,wgpuComputePassEncoderEnd:_wgpuComputePassEncoderEnd,wgpuComputePassEncoderSetBindGroup:_wgpuComputePassEncoderSetBindGroup,wgpuComputePassEncoderSetPipeline:_wgpuComputePassEncoderSetPipeline,wgpuComputePipelineGetBindGroupLayout:_wgpuComputePipelineGetBindGroupLayout,wgpuDeviceCreateBindGroup:_wgpuDeviceCreateBindGroup,wgpuDeviceCreateCommandEncoder:_wgpuDeviceCreateCommandEncoder,wgpuDeviceCreateComputePipeline:_wgpuDeviceCreateComputePipeline,wgpuInstanceHasWGSLLanguageFeature:_wgpuInstanceHasWGSLLanguageFeature,wgpuQueueSubmit:_wgpuQueueSubmit,wgpuQueueWriteBuffer:_wgpuQueueWriteBuffer}}function applySignatureConversions(wasmExports){wasmExports=Object.assign({},wasmExports);var makeWrapper_pp=f=>a0=>Number(f(BigInt(a0)));var makeWrapper__p=f=>a0=>f(BigInt(a0));var makeWrapper___PP=f=>(a0,a1,a2)=>f(a0,BigInt(a1?a1:0),BigInt(a2?a2:0));var makeWrapper_p=f=>()=>Number(f());var makeWrapper_ppp=f=>(a0,a1)=>Number(f(BigInt(a0),BigInt(a1)));var makeWrapper__p_____=f=>(a0,a1,a2,a3,a4,a5)=>f(BigInt(a0),a1,a2,a3,a4,a5);var makeWrapper___p_p_=f=>(a0,a1,a2,a3,a4)=>f(a0,BigInt(a1),a2,BigInt(a3),a4);var makeWrapper__pp=f=>(a0,a1)=>f(BigInt(a0),BigInt(a1));wasmExports["malloc"]=makeWrapper_pp(wasmExports["malloc"]);wasmExports["free"]=makeWrapper__p(wasmExports["free"]);wasmExports["main"]=makeWrapper___PP(wasmExports["main"]);wasmExports["pthread_self"]=makeWrapper_p(wasmExports["pthread_self"]);wasmExports["emscripten_builtin_memalign"]=makeWrapper_ppp(wasmExports["emscripten_builtin_memalign"]);wasmExports["_emscripten_thread_init"]=makeWrapper__p_____(wasmExports["_emscripten_thread_init"]);wasmExports["_emscripten_run_js_on_main_thread"]=makeWrapper___p_p_(wasmExports["_emscripten_run_js_on_main_thread"]);wasmExports["_emscripten_thread_free_data"]=makeWrapper__p(wasmExports["_emscripten_thread_free_data"]);wasmExports["_emscripten_thread_exit"]=makeWrapper__p(wasmExports["_emscripten_thread_exit"]);wasmExports["memalign"]=makeWrapper_ppp(wasmExports["memalign"]);wasmExports["emscripten_stack_set_limits"]=makeWrapper__pp(wasmExports["emscripten_stack_set_limits"]);wasmExports["_emscripten_stack_restore"]=makeWrapper__p(wasmExports["_emscripten_stack_restore"]);wasmExports["_emscripten_stack_alloc"]=makeWrapper_pp(wasmExports["_emscripten_stack_alloc"]);wasmExports["emscripten_stack_get_current"]=makeWrapper_p(wasmExports["emscripten_stack_get_current"]);return wasmExports}async function callMain(){var entryFunction=_main;var argc=0;var argv=0;try{var ret=entryFunction(argc,BigInt(argv));ret=await ret;exitJS(ret,true);return ret}catch(e){return handleException(e)}}function run(){if(runDependencies>0){dependenciesFulfilled=run;return}if(ENVIRONMENT_IS_PTHREAD){initRuntime();return}preRun();if(runDependencies>0){dependenciesFulfilled=run;return}async function doRun(){Module["calledRun"]=true;if(ABORT)return;initRuntime();preMain();Module["onRuntimeInitialized"]?.();var noInitialRun=Module["noInitialRun"]||false;if(!noInitialRun)await callMain();postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(()=>{setTimeout(()=>Module["setStatus"](""),1);doRun()},1)}else{doRun()}}var wasmExports;if(!ENVIRONMENT_IS_PTHREAD){createWasm();run()}\n';

// src/worker.ts
var FILE_READ_REQ_EVENT = "fs.read_req";
var JSPI_STUB = `
if (!WebAssembly.Suspending) {
  // JSPI not available - stubs that keep the import/export tables valid.
  // Suspending wraps imports: identity is fine since async imports won't be called.
  WebAssembly.Suspending = function (fn) {
    // console.log(fn.toString());
    return fn;
  };
  // promising wraps exports: must return a Promise so ccall's ret.then() works.
  WebAssembly.promising = function (fn) {
    return function (...args) {
      try {
        return Promise.resolve(fn(...args));
      } catch (e) {
        return Promise.reject(e);
      }
    };
  };
}
`;
var ProxyToWorker = class {
  // filename -> Blob for async reads
  constructor(resources, nbThread, suppressNativeLog, logger) {
    __publicField(this, "resources");
    __publicField(this, "logger");
    __publicField(this, "suppressNativeLog");
    __publicField(this, "taskQueue", []);
    __publicField(this, "taskId", 1);
    __publicField(this, "resultQueue", []);
    __publicField(this, "busy", false);
    // is the work loop is running?
    __publicField(this, "worker");
    __publicField(this, "multiThread");
    __publicField(this, "nbThread");
    __publicField(this, "useAsyncFile");
    __publicField(this, "fileBlobs", /* @__PURE__ */ new Map());
    this.resources = resources;
    this.nbThread = nbThread;
    this.multiThread = nbThread > 0;
    this.logger = logger;
    this.suppressNativeLog = suppressNativeLog;
    this.useAsyncFile = canUseAsyncFileRead(resources.compat);
  }
  getModuleCode() {
    return __async(this, null, function* () {
      if (!this.resources.jsPath) {
        if (this.resources.compat) {
          throw new Error(
            "compat mode is enabled but no jsPath was provided. Pass a worker JS via setCompat() or install @wllama/wllama-compat."
          );
        }
        return WLLAMA_EMSCRIPTEN_CODE;
      } else if (this.resources.jsPath.code) {
        return this.resources.jsPath.code;
      } else if (isString(this.resources.jsPath)) {
        const response = yield fetch(this.resources.jsPath);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch worker code from ${this.resources.jsPath}`
          );
        }
        return yield response.text();
      } else {
        throw new Error("No JS code provided for worker");
      }
    });
  }
  moduleInit(ggufFiles) {
    return __async(this, null, function* () {
      let moduleCode = JSPI_STUB + (yield this.getModuleCode());
      if (this.resources.noWebGPU) {
        moduleCode = 'try{Object.defineProperty(WorkerNavigator.prototype,"gpu",{get:()=>({requestAdapter:async()=>null})});}catch(e){}' + moduleCode;
      }
      let mainModuleCode = moduleCode.replace("var Module", "var ___Module");
      const runOptions = {
        pathConfig: {
          "wllama.wasm": this.resources.wasmPath
        },
        nbThread: this.nbThread,
        compat: this.resources.compat
      };
      const completeCode = [
        `const RUN_OPTIONS = ${JSON.stringify(runOptions)};`,
        `function wModuleInit() { ${mainModuleCode}; return Module; }`,
        LLAMA_CPP_WORKER_CODE
      ].join(";\n\n");
      this.worker = createWorker(completeCode);
      this.worker.onmessage = this.onRecvMsg.bind(this);
      this.worker.onerror = this.logger.error;
      const res = yield this.pushTask({
        verb: "module.init",
        args: [
          new Blob([moduleCode], { type: "text/javascript" }),
          this.useAsyncFile
        ],
        callbackId: this.taskId++
      });
      const nativeFiles = [];
      for (const file of ggufFiles) {
        const needAllocBuffer = !this.useAsyncFile;
        const id = yield this.fileAlloc(
          file.name,
          file.blob.size,
          needAllocBuffer
        );
        nativeFiles.push(__spreadValues({ id }, file));
        if (this.useAsyncFile) {
          this.fileBlobs.set(file.name, file.blob);
        }
      }
      if (!this.useAsyncFile) {
        yield Promise.all(
          nativeFiles.map((file) => {
            return this.fileWrite(file.id, file.blob);
          })
        );
      }
      return res;
    });
  }
  wllamaStart() {
    return __async(this, null, function* () {
      const result = yield this.pushTask({
        verb: "wllama.start",
        args: [],
        callbackId: this.taskId++
      });
      const parsedResult = this.parseResult(result);
      return parsedResult;
    });
  }
  wllamaAction(name, body) {
    return __async(this, null, function* () {
      const encodedMsg = glueSerialize(body);
      const result = yield this.pushTask({
        verb: "wllama.action",
        args: [name, encodedMsg],
        callbackId: this.taskId++
      });
      const parsedResult = glueDeserialize(result);
      return parsedResult;
    });
  }
  wllamaExit() {
    return __async(this, null, function* () {
      if (this.worker) {
        this.worker.terminate();
      }
    });
  }
  wllamaDebug() {
    return __async(this, null, function* () {
      const result = yield this.pushTask({
        verb: "wllama.debug",
        args: [],
        callbackId: this.taskId++
      });
      return JSON.parse(result);
    });
  }
  ///////////////////////////////////////
  /**
   * Allocate a new file in heapfs
   * @returns fileId, to be used by fileWrite()
   */
  fileAlloc(fileName, size, allocBuffer) {
    return __async(this, null, function* () {
      const result = yield this.pushTask({
        verb: "fs.alloc",
        args: [fileName, size, allocBuffer],
        callbackId: this.taskId++
      });
      return result.fileId;
    });
  }
  /**
   * Write a Blob to heapfs
   */
  fileWrite(fileId, blob) {
    return __async(this, null, function* () {
      const reader = blob.stream().getReader();
      let offset = 0;
      while (true) {
        const { done, value } = yield reader.read();
        if (done) break;
        const size = value.byteLength;
        yield this.pushTask(
          {
            verb: "fs.write",
            args: [fileId, value, offset],
            callbackId: this.taskId++
          },
          // @ts-ignore Type 'ArrayBufferLike' is not assignable to type 'ArrayBuffer'
          [value.buffer]
        );
        offset += size;
      }
    });
  }
  fileReadResponse(name, offset, size) {
    return __async(this, null, function* () {
      var _a;
      try {
        const blob = this.fileBlobs.get(name);
        if (!blob) {
          throw new Error(`blob not found for name="${name}"`);
        }
        const chunk = blob.slice(offset, offset + size);
        const buffer = yield chunk.arrayBuffer();
        this.worker.postMessage(
          { verb: "fs.read_res", args: [buffer] },
          { transfer: [buffer] }
        );
      } catch (err) {
        this.logger.error("fileReadResponse failed, terminating worker:", err);
        (_a = this.worker) == null ? void 0 : _a.terminate();
        this.worker = void 0;
        this.abort(`File read failed: ${err}`, err.stack || "");
      }
    });
  }
  /**
   * Parse JSON result returned by cpp code.
   * Throw new Error if "__exception" is present in the response
   *
   * TODO: get rid of this function once everything is migrated to Glue
   */
  parseResult(result) {
    const parsedResult = JSON.parse(result);
    if (parsedResult && parsedResult["error"]) {
      throw new WllamaRuntimeError("Unknown error, please see console.log", "");
    }
    return parsedResult;
  }
  /**
   * Push a new task to taskQueue
   */
  pushTask(param, buffers) {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ resolve, reject, param, buffers });
      this.runTaskLoop();
    });
  }
  /**
   * Main loop for processing tasks
   */
  runTaskLoop() {
    return __async(this, null, function* () {
      var _a;
      if (this.busy) {
        return;
      }
      this.busy = true;
      while (true) {
        const task = this.taskQueue.shift();
        if (!task) break;
        this.resultQueue.push(task);
        this.worker.postMessage(
          task.param,
          isSafariMobile() ? void 0 : {
            transfer: (_a = task.buffers) != null ? _a : []
          }
        );
      }
      this.busy = false;
    });
  }
  /**
   * Handle messages from worker
   */
  onRecvMsg(e) {
    if (!e.data) return;
    const { verb, args } = e.data;
    const isCompatBuild = this.resources.compat;
    if (verb && verb.startsWith("console.")) {
      if (this.suppressNativeLog) {
        return;
      }
      if (verb.endsWith("debug")) this.logger.debug(...args);
      if (verb.endsWith("log")) this.logger.log(...args);
      if (verb.endsWith("warn")) this.logger.warn(...args);
      if (verb.endsWith("error")) this.logger.error(...args);
      return;
    } else if (verb === "signal.abort") {
      const [signalType, message, rawStack, originalErr] = args;
      if (originalErr) {
        this.logger.error(originalErr);
      }
      (() => __async(this, null, function* () {
        let stack = "";
        let newMsg = message.replace(
          "Build with -sASSERTIONS for more info.",
          ""
        );
        if (signalType === "abort") {
          newMsg = `(ABORT) ${newMsg}`;
          stack = rawStack.replace(/\|/g, "\n");
        } else if (signalType === "exception") {
          stack = rawStack;
        }
        const decoded = yield Debug.decodeStackTrace(stack, isCompatBuild);
        this.logger.error(`Stack trace (${signalType}):
` + decoded);
        this.abort(newMsg, decoded);
      }))();
      return;
    }
    if (verb === FILE_READ_REQ_EVENT) {
      const [name, offset, size] = args;
      this.fileReadResponse(name, offset, size).catch(() => {
      });
      return;
    }
    const { callbackId, result, err } = e.data;
    if (callbackId) {
      const idx = this.resultQueue.findIndex(
        (t) => t.param.callbackId === callbackId
      );
      if (idx !== -1) {
        const waitingTask = this.resultQueue.splice(idx, 1)[0];
        if (err) waitingTask.reject(err);
        else waitingTask.resolve(result);
      } else {
        this.logger.error(
          `Cannot find waiting task with callbackId = ${callbackId}`
        );
      }
    }
  }
  abort(text, stack) {
    const error = new WllamaRuntimeError(
      text.length == 0 ? "(unknown error)" : text,
      stack
    );
    while (this.resultQueue.length > 0) {
      const waitingTask = this.resultQueue.pop();
      if (!waitingTask) break;
      waitingTask.reject(error);
    }
    while (this.taskQueue.length > 0) {
      const pendingTask = this.taskQueue.pop();
      if (!pendingTask) break;
      pendingTask.reject(error);
    }
  }
};

// src/huggingface.ts
var HF_BASE = "https://huggingface.co";
var DEFAULT_QUANTS = ["Q4_K_M", "Q8_0"];
function fetchRepoFiles(repo, token) {
  return __async(this, null, function* () {
    var _a;
    const url = `${HF_BASE}/api/models/${repo}/tree/main?recursive=true`;
    const headers = { Accept: "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = yield fetch(url, { headers });
    if (!res.ok) {
      let msg = res.statusText;
      try {
        msg = (_a = (yield res.json()).error) != null ? _a : msg;
      } catch (e) {
      }
      throw new Error(`HF API error (${res.status}): ${msg}`);
    }
    return res.json();
  });
}
function firstShardPath(files, path) {
  const m = path.match(/^(.+)-(\d{5})-of-(\d{5})\.gguf$/i);
  if (!m) return path;
  const first = `${m[1]}-00001-of-${m[3]}.gguf`;
  return files.some((f) => f.path === first) ? first : path;
}
function selectFile(files, quant, mmprojOnly) {
  const candidates = files.filter((f) => {
    if (f.type !== "file" || !f.path.toLowerCase().endsWith(".gguf"))
      return false;
    const ismmproj = f.path.toLowerCase().includes("mmproj");
    return mmprojOnly ? ismmproj : !ismmproj;
  });
  if (candidates.length === 0) return null;
  if (quant) {
    const upper = quant.toUpperCase();
    const match = candidates.find((f) => f.path.toUpperCase().includes(upper));
    if (match) return firstShardPath(candidates, match.path);
    return null;
  }
  for (const q of DEFAULT_QUANTS) {
    const match = candidates.find((f) => f.path.toUpperCase().includes(q));
    if (match) return firstShardPath(candidates, match.path);
  }
  return firstShardPath(candidates, candidates[0].path);
}
function getHFModelSource(config) {
  return __async(this, null, function* () {
    const { repo, file, quant, mmprojFile, mmprojQuant, hfToken } = config;
    const files = yield fetchRepoFiles(repo, hfToken);
    const modelPath = file != null ? file : selectFile(files, quant, false);
    if (!modelPath) {
      throw new Error(`No GGUF file found in repo "${repo}"`);
    }
    const source = {
      url: `${HF_BASE}/${repo}/resolve/main/${modelPath}`
    };
    if (mmprojFile || mmprojQuant !== void 0) {
      const mmpath = mmprojFile != null ? mmprojFile : selectFile(files, mmprojQuant, true);
      if (mmpath) {
        source.mmprojUrl = `${HF_BASE}/${repo}/resolve/main/${mmpath}`;
      }
    }
    if (hfToken) {
      const params = new URLSearchParams({ token: hfToken });
      source.url += `?${params}`;
      if (source.mmprojUrl) {
        source.mmprojUrl += `?${params}`;
      }
    }
    return source;
  });
}
function getHFFileSHA256(url, headers) {
  return __async(this, null, function* () {
    if (!url.includes("/resolve/")) return void 0;
    const rawUrl = url.replace("/resolve/", "/raw/");
    try {
      const text = yield fetch(rawUrl, { headers }).then((r) => r.text());
      const match = text.match(/^oid sha256:([0-9a-f]{64})$/m);
      return match ? match[1] : void 0;
    } catch (e) {
      return void 0;
    }
  });
}

// src/storage/opfs.ts
var OPFSBackend = class {
  isSupported() {
    var _a;
    return typeof navigator !== "undefined" && "storage" in navigator && !!((_a = navigator.storage) == null ? void 0 : _a.getDirectory);
  }
  read(key) {
    return __async(this, null, function* () {
      try {
        const cacheDir = yield getCacheDir();
        const fileHandle = yield cacheDir.getFileHandle(key);
        return yield fileHandle.getFile();
      } catch (e) {
        return null;
      }
    });
  }
  write(key, stream) {
    return __async(this, null, function* () {
      const writable = yield openWritable(key);
      yield writable.truncate(0);
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = yield reader.read();
          if (done) break;
          yield writable.write(value);
        }
      } finally {
        yield writable.close();
      }
    });
  }
  getSize(key) {
    return __async(this, null, function* () {
      try {
        const cacheDir = yield getCacheDir();
        const fileHandle = yield cacheDir.getFileHandle(key);
        const file = yield fileHandle.getFile();
        return file.size;
      } catch (e) {
        return -1;
      }
    });
  }
  list() {
    return __async(this, null, function* () {
      const cacheDir = yield getCacheDir();
      const result = [];
      try {
        for (var iter = __forAwait(cacheDir.entries()), more, temp, error; more = !(temp = yield iter.next()).done; more = false) {
          const [name, handle] = temp.value;
          if (handle.kind === "file") {
            const file = yield handle.getFile();
            result.push({ key: name, size: file.size });
          }
        }
      } catch (temp) {
        error = [temp];
      } finally {
        try {
          more && (temp = iter.return) && (yield temp.call(iter));
        } finally {
          if (error)
            throw error[0];
        }
      }
      return result;
    });
  }
  delete(key) {
    return __async(this, null, function* () {
      try {
        const cacheDir = yield getCacheDir();
        yield cacheDir.removeEntry(key);
      } catch (e) {
        if ((e == null ? void 0 : e.name) !== "NotFoundError") throw e;
      }
    });
  }
};
function getCacheDir() {
  return __async(this, null, function* () {
    const opfsRoot = yield navigator.storage.getDirectory();
    return opfsRoot.getDirectoryHandle("cache", { create: true });
  });
}
function openWritable(fileName) {
  return __async(this, null, function* () {
    const worker = createWorker(OPFS_UTILS_WORKER_CODE);
    let pResolve;
    let pReject;
    worker.onmessage = (e) => {
      if (e.data.ok) pResolve(null);
      else if (e.data.err) pReject(e.data.err);
    };
    worker.onerror = (e) => {
      var _a;
      return pReject == null ? void 0 : pReject((_a = e.message) != null ? _a : e);
    };
    const workerExec = (data) => new Promise((resolve, reject) => {
      pResolve = resolve;
      pReject = reject;
      worker.postMessage(
        data,
        isSafariMobile() ? void 0 : { transfer: "buf" in data && data.buf ? [data.buf.buffer] : [] }
      );
    });
    yield workerExec({ action: "open", filename: fileName });
    return {
      truncate: () => __async(this, null, function* () {
      }),
      write: (value) => workerExec({ action: "write", buf: value }),
      close: () => __async(this, null, function* () {
        yield workerExec({ action: "close" });
        worker.terminate();
      })
    };
  });
}

// src/storage/cos.ts
function makeHash(key) {
  return { algorithm: "SHA-256", value: key };
}
var COSInternalBackend = class {
  isSupported() {
    return typeof navigator !== "undefined" && "crossOriginStorage" in navigator;
  }
  // IMPORTANT: key must be SHA-256 hash of the data
  read(key) {
    return __async(this, null, function* () {
      try {
        const handle = yield navigator.crossOriginStorage.requestFileHandle(
          makeHash(key)
        );
        return handle.getFile();
      } catch (e) {
        return null;
      }
    });
  }
  // IMPORTANT: key must be SHA-256 hash of the data
  write(key, stream) {
    return __async(this, null, function* () {
      const handle = yield navigator.crossOriginStorage.requestFileHandle(
        makeHash(key),
        { create: true }
      );
      const writable = yield handle.createWritable();
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = yield reader.read();
          if (done) break;
          yield writable.write(value);
        }
      } finally {
        yield writable.close();
      }
    });
  }
  // IMPORTANT: key must be SHA-256 hash of the data
  getSize(key) {
    return __async(this, null, function* () {
      try {
        const handle = yield navigator.crossOriginStorage.requestFileHandle(
          makeHash(key)
        );
        const file = yield handle.getFile();
        return file.size;
      } catch (e) {
        return -1;
      }
    });
  }
  list() {
    return __async(this, null, function* () {
      throw new Error("not implemented");
    });
  }
  delete(_key) {
    return __async(this, null, function* () {
      throw new Error("not implemented");
    });
  }
};
var COSBackend = class {
  constructor() {
    __publicField(this, "cos", new COSInternalBackend());
    __publicField(this, "priv", new OPFSBackend());
  }
  isSupported() {
    return this.priv.isSupported();
  }
  read(key, hint) {
    return __async(this, null, function* () {
      if ((hint == null ? void 0 : hint.sha256) && this.cos.isSupported()) {
        const blob = yield this.cos.read(hint.sha256);
        if (blob) return blob;
      }
      return this.priv.read(key);
    });
  }
  write(key, stream, hint) {
    return __async(this, null, function* () {
      if ((hint == null ? void 0 : hint.sha256) && this.cos.isSupported()) {
        yield this.cos.write(hint.sha256, stream);
      } else {
        yield this.priv.write(key, stream);
      }
    });
  }
  getSize(key, hint) {
    return __async(this, null, function* () {
      if ((hint == null ? void 0 : hint.sha256) && this.cos.isSupported()) {
        const size = yield this.cos.getSize(hint.sha256);
        if (size !== -1) return size;
      }
      return this.priv.getSize(key);
    });
  }
  list() {
    return __async(this, null, function* () {
      return this.priv.list();
    });
  }
  delete(key) {
    return __async(this, null, function* () {
      return this.priv.delete(key);
    });
  }
};

// src/cache-manager.ts
var PREFIX_METADATA = "__metadata__";
var POLYFILL_ETAG = "polyfill_for_older_version";
function hintFromMetadata(metadata) {
  if (!metadata) return void 0;
  if (metadata.sha256) return { sha256: metadata.sha256 };
  return void 0;
}
var CacheManager = class {
  /**
   * @param backends Array of storage backends to use, in order of preference ; if first is available, use it, otherwise try the next one.
   */
  constructor(backends = [new COSBackend()]) {
    __publicField(this, "sb");
    for (const backend of backends) {
      if (backend.isSupported()) {
        this.sb = backend;
        return;
      }
    }
    throw new Error("No supported storage backend found");
  }
  /**
   * Convert a given URL into a storage key.
   *
   * Format: `${hashSHA1(fullURL)}_${fileName}`
   */
  getNameFromURL(url) {
    return __async(this, null, function* () {
      return urlToFileName(url, "");
    });
  }
  /**
   * @deprecated Use `download()` instead
   *
   * Write a new file to cache. This will overwrite existing file.
   *
   * @param name The file name returned by `getNameFromURL()` or `list()`
   */
  write(name, stream, metadata) {
    return __async(this, null, function* () {
      yield this.sb.write(name, stream);
      yield this.writeMetadata(name, metadata);
    });
  }
  download(_0) {
    return __async(this, arguments, function* (url, options = {}) {
      var _a, _b, _c, _d;
      const fileKey = yield urlToFileName(url, "");
      const sha256 = yield getHFFileSHA256(url, (_a = options.headers) != null ? _a : {});
      const hint = sha256 ? { sha256 } : void 0;
      const cachedSize = yield this.sb.getSize(fileKey, hint);
      if (cachedSize !== -1) {
        const metadata2 = yield this.readMetadata(fileKey);
        if ((metadata2 == null ? void 0 : metadata2.originalURL) === url && metadata2.originalSize === cachedSize) {
          return;
        }
        const head = yield fetch(url, __spreadValues({
          method: "HEAD"
        }, options.headers ? { headers: options.headers } : {}));
        const originalSize = parseInt(
          (_b = head.headers.get("content-length")) != null ? _b : "0",
          10
        );
        const etag2 = (head.headers.get("etag") || "").replace(
          /[^A-Za-z0-9]/g,
          ""
        );
        if (originalSize > 0 && originalSize === cachedSize) {
          yield this.writeMetadata(fileKey, __spreadValues({
            originalURL: url,
            originalSize,
            etag: etag2,
            sha256
          }, (_c = options.metadataAdditional) != null ? _c : {}));
          return;
        }
        yield this.sb.delete(fileKey);
        yield this.sb.delete(`${PREFIX_METADATA}${fileKey}`);
      }
      const response = yield fetch(url, __spreadValues(__spreadValues({}, options.headers ? { headers: options.headers } : {}), options.signal ? { signal: options.signal } : {}));
      if (!response.ok || !response.body) {
        throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
      }
      const contentLength = response.headers.get("content-length");
      const etag = (response.headers.get("etag") || "").replace(
        /[^A-Za-z0-9]/g,
        ""
      );
      const total = parseInt(contentLength != null ? contentLength : "0", 10);
      const progressCallback = options.progressCallback;
      let loaded = 0;
      let lastProgressAt = 0;
      const progressStream = new TransformStream({
        transform(chunk, controller) {
          loaded += chunk.byteLength;
          if (progressCallback) {
            const now = Date.now();
            if (now - lastProgressAt > 100) {
              lastProgressAt = now;
              progressCallback({ loaded, total });
            }
          }
          controller.enqueue(chunk);
        },
        flush() {
          progressCallback == null ? void 0 : progressCallback({ loaded, total: total || loaded });
        }
      });
      const metadata = __spreadValues({
        originalURL: url,
        originalSize: total,
        etag
      }, (_d = options.metadataAdditional) != null ? _d : {});
      if (sha256) {
        metadata.sha256 = sha256;
      }
      yield this.sb.write(
        fileKey,
        response.body.pipeThrough(progressStream),
        hint
      );
      yield this.writeMetadata(fileKey, metadata);
    });
  }
  /**
   * Open a file in cache for reading
   *
   * @param nameOrURL The file name returned by `getNameFromURL()` or `list()`, or the original URL of the remote file
   * @returns Blob, or null if file does not exist
   */
  open(nameOrURL) {
    return __async(this, null, function* () {
      const hint1 = hintFromMetadata(yield this.getMetadata(nameOrURL));
      const direct = yield this.sb.read(nameOrURL, hint1);
      if (direct) return direct;
      const key = yield urlToFileName(nameOrURL, "");
      const hint2 = hintFromMetadata(yield this.getMetadata(key));
      return this.sb.read(key, hint2);
    });
  }
  /**
   * Get the size of a file in stored cache
   *
   * NOTE: in case the download is stopped mid-way (i.e. user close browser tab), the file maybe corrupted, size maybe different from `metadata.originalSize`
   *
   * @param name The file name returned by `getNameFromURL()` or `list()`
   * @returns number of bytes, or -1 if file does not exist
   */
  getSize(name) {
    return __async(this, null, function* () {
      const hint = hintFromMetadata(yield this.getMetadata(name));
      return this.sb.getSize(name, hint);
    });
  }
  /**
   * Get metadata of a cached file
   */
  getMetadata(name) {
    return __async(this, null, function* () {
      const metadata = yield this.readMetadata(name);
      if (metadata) return metadata;
      const cachedSize = yield this.sb.getSize(name);
      return cachedSize > 0 ? (
        // files created by older version of wllama don't have metadata; polyfill it
        {
          etag: POLYFILL_ETAG,
          originalSize: cachedSize,
          originalURL: ""
        }
      ) : (
        // cached file not found
        null
      );
    });
  }
  /**
   * Same as `getMetadata()`, but without polyfill. Returns null if the file has no metadata.
   */
  readMetadata(name) {
    return __async(this, null, function* () {
      const blob = yield this.sb.read(`${PREFIX_METADATA}${name}`);
      if (!blob) return null;
      try {
        return yield new Response(blob).json();
      } catch (e) {
        return null;
      }
    });
  }
  /**
   * List all files currently in cache
   */
  list() {
    return __async(this, null, function* () {
      const all = yield this.sb.list();
      const metadataMap = {};
      for (const { key } of all) {
        if (key.startsWith(PREFIX_METADATA)) {
          const blob = yield this.sb.read(key);
          if (blob) {
            const meta = yield new Response(blob).json().catch(() => null);
            metadataMap[key.slice(PREFIX_METADATA.length)] = meta;
          }
        }
      }
      const result = [];
      for (const { key, size } of all) {
        if (!key.startsWith(PREFIX_METADATA)) {
          result.push({
            name: key,
            size,
            metadata: metadataMap[key] || {
              originalSize: size,
              originalURL: "",
              etag: ""
            }
          });
        }
      }
      return result;
    });
  }
  /**
   * Clear all files currently in cache
   */
  clear() {
    return __async(this, null, function* () {
      yield this.deleteMany(() => true);
    });
  }
  /**
   * Delete a single file in cache
   *
   * @param nameOrURL Can be either an URL or a name returned by `getNameFromURL()` or `list()`
   */
  delete(nameOrURL) {
    return __async(this, null, function* () {
      const name2 = yield this.getNameFromURL(nameOrURL);
      yield this.deleteMany(
        (entry) => entry.name === nameOrURL || entry.name === name2
      );
    });
  }
  /**
   * Delete multiple files in cache.
   *
   * @param predicate A predicate like `array.filter(item => boolean)`
   */
  deleteMany(predicate) {
    return __async(this, null, function* () {
      const list = yield this.list();
      for (const item of list) {
        if (predicate(item)) {
          yield this.sb.delete(item.name);
          yield this.sb.delete(`${PREFIX_METADATA}${item.name}`);
        }
      }
    });
  }
  /**
   * Write the metadata of the file to disk.
   */
  writeMetadata(name, metadata) {
    return __async(this, null, function* () {
      const blob = new Blob([JSON.stringify(metadata)], { type: "text/plain" });
      yield this.sb.write(`${PREFIX_METADATA}${name}`, blob.stream());
    });
  }
};
var cache_manager_default = CacheManager;
function urlToFileName(url, prefix) {
  return __async(this, null, function* () {
    const hashBuffer = yield crypto.subtle.digest(
      "SHA-1",
      new TextEncoder().encode(url)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return `${prefix}${hashHex}_${url.split("/").pop()}`;
  });
}

// src/model-manager.ts
var DEFAULT_PARALLEL_DOWNLOADS = 3;
var ModelValidationStatus = /* @__PURE__ */ ((ModelValidationStatus2) => {
  ModelValidationStatus2["VALID"] = "valid";
  ModelValidationStatus2["INVALID"] = "invalid";
  ModelValidationStatus2["DELETED"] = "deleted";
  return ModelValidationStatus2;
})(ModelValidationStatus || {});
var Model = class {
  constructor(modelManager, url, mmprojUrl, savedFiles) {
    __publicField(this, "modelManager");
    /**
     * URL to the GGUF file (in case it contains multiple shards, the URL should point to the first shard)
     *
     * This URL will be used to identify the model in the cache. There can't be 2 models with the same URL.
     */
    __publicField(this, "url");
    /**
     * URL to mmproj file, if exists
     */
    __publicField(this, "mmprojUrl");
    /**
     * Size in bytes (total size of all shards).
     *
     * A value of -1 means the model is deleted from the cache. You must call `ModelManager.downloadModel` to re-download the model.
     */
    __publicField(this, "size");
    /**
     * List of all shards in the cache, sorted by original URL (ascending order)
     */
    __publicField(this, "files");
    this.modelManager = modelManager;
    this.url = url;
    this.mmprojUrl = mmprojUrl;
    if (savedFiles) {
      this.files = this.getAllFiles(savedFiles);
      this.size = sumArr(this.files.map((f) => f.metadata.originalSize));
    } else {
      this.files = [];
      this.size = 0;
    }
  }
  /**
   * Open and get a list of all shards as Blobs
   */
  open() {
    return __async(this, null, function* () {
      if (this.size === -1) {
        throw new WllamaError(
          `Model is deleted from the cache; Call ModelManager.downloadModel to re-download the model`,
          "load_error"
        );
      }
      const blobs = [];
      for (const file of this.files) {
        const blob = yield this.modelManager.cacheManager.open(file.name);
        if (!blob) {
          throw new Error(
            `Failed to open file ${file.name}; Hint: the model may be invalid, please refresh it`
          );
        }
        blobs.push(blob);
      }
      return blobs;
    });
  }
  /**
   * Validate the model files.
   *
   * If the model is invalid, the model manager will not be able to use it. You must call `refresh` to re-download the model.
   *
   * Cases that model is invalid:
   * - The model is deleted from the cache
   * - The model files are missing (or the download is interrupted)
   */
  validate() {
    let nbShards = ModelManager.parseModelUrl(this.url).length;
    if (this.mmprojUrl) {
      nbShards += 1;
    }
    if (this.size === -1) {
      return "deleted" /* DELETED */;
    }
    if (this.size < 16 || this.files.length !== nbShards) {
      return "invalid" /* INVALID */;
    }
    for (const file of this.files) {
      if (!file.metadata || file.metadata.originalSize !== file.size) {
        return "invalid" /* INVALID */;
      }
    }
    return "valid" /* VALID */;
  }
  /**
   * In case the model is invalid, call this function to re-download the model
   */
  refresh() {
    return __async(this, arguments, function* (options = {}) {
      var _a;
      const urls = ModelManager.parseModelUrl(this.url);
      if (this.mmprojUrl) {
        urls.push(this.mmprojUrl);
      }
      const works = urls.map((url, index) => ({
        url,
        index
      }));
      this.modelManager.logger.debug("Downloading model files:", urls);
      const nParallel = (_a = this.modelManager.params.parallelDownloads) != null ? _a : DEFAULT_PARALLEL_DOWNLOADS;
      const totalSize = yield this.getTotalDownloadSize(urls);
      const loadedSize = [];
      const worker = () => __async(this, null, function* () {
        while (works.length > 0) {
          const w = works.shift();
          if (!w) break;
          yield this.modelManager.cacheManager.download(w.url, __spreadProps(__spreadValues({}, options), {
            metadataAdditional: {
              originalURL: w.url,
              mmprojURL: this.mmprojUrl
            },
            progressCallback: ({ loaded }) => {
              var _a2;
              loadedSize[w.index] = loaded;
              (_a2 = options.progressCallback) == null ? void 0 : _a2.call(options, {
                loaded: sumArr(loadedSize),
                total: totalSize
              });
            }
          }));
        }
      });
      const promises = [];
      for (let i = 0; i < nParallel; i++) {
        promises.push(worker());
        loadedSize.push(0);
      }
      yield Promise.all(promises);
      this.files = this.getAllFiles(yield this.modelManager.cacheManager.list());
      this.size = this.files.reduce((acc, f) => acc + f.metadata.originalSize, 0);
    });
  }
  /**
   * Remove the model from the cache
   */
  remove() {
    return __async(this, null, function* () {
      this.files = this.getAllFiles(yield this.modelManager.cacheManager.list());
      yield this.modelManager.cacheManager.deleteMany(
        (f) => !!this.files.find((file) => file.name === f.name)
      );
      this.size = -1;
    });
  }
  getAllFiles(savedFiles) {
    const allUrls = new Set(ModelManager.parseModelUrl(this.url));
    if (this.mmprojUrl) {
      allUrls.add(this.mmprojUrl);
    }
    const allFiles = [];
    for (const url of allUrls) {
      const file = savedFiles.find((f) => f.metadata.originalURL === url);
      if (!file) {
        throw new Error(`Model file not found: ${url}`);
      }
      allFiles.push(file);
    }
    allFiles.sort(
      (a, b) => a.metadata.originalURL.localeCompare(b.metadata.originalURL)
    );
    return allFiles;
  }
  getTotalDownloadSize(urls) {
    return __async(this, null, function* () {
      const responses = yield Promise.all(
        urls.map((url) => fetch(url, { method: "HEAD" }))
      );
      const sizes = responses.map(
        (res) => Number(res.headers.get("content-length") || "0")
      );
      return sumArr(sizes);
    });
  }
};
var ModelManager = class _ModelManager {
  constructor(params = {}) {
    // The CacheManager singleton, can be accessed by user
    __publicField(this, "cacheManager");
    __publicField(this, "params");
    __publicField(this, "logger");
    this.cacheManager = params.cacheManager || new cache_manager_default();
    this.params = params;
    this.logger = params.logger || console;
  }
  /**
   * Parses a model URL and returns an array of URLs based on the following patterns:
   * - If the input URL is an array, it returns the array itself.
   * - If the input URL is a string in the `gguf-split` format, it returns an array containing the URL of each shard in ascending order.
   * - Otherwise, it returns an array containing the input URL as a single element array.
   * @param modelUrl URL or list of URLs
   */
  static parseModelUrl(modelUrl) {
    var _a;
    if (Array.isArray(modelUrl)) {
      return modelUrl;
    }
    const urlPartsRegex = /-(\d{5})-of-(\d{5})\.gguf(?:\?.*)?$/;
    const queryMatch = modelUrl.match(/\.gguf(\?.*)?$/);
    const queryParams = (_a = queryMatch == null ? void 0 : queryMatch[1]) != null ? _a : "";
    const matches = modelUrl.match(urlPartsRegex);
    if (!matches) {
      return [modelUrl];
    }
    const baseURL = modelUrl.replace(urlPartsRegex, "");
    const total = matches[2];
    const paddedShardIds = Array.from(
      { length: Number(total) },
      (_, index) => (index + 1).toString().padStart(5, "0")
    );
    return paddedShardIds.map(
      (current) => `${baseURL}-${current}-of-${total}.gguf${queryParams}`
    );
  }
  /**
   * Get all models in the cache
   */
  getModels() {
    return __async(this, arguments, function* (opts = {}) {
      const cachedFiles = yield this.cacheManager.list();
      let models = [];
      for (const file of cachedFiles) {
        if (!file.metadata.originalURL) continue;
        const shards = _ModelManager.parseModelUrl(file.metadata.originalURL);
        const mmprojUrl = file.metadata.mmprojURL;
        const isFirstShard = shards.length === 1 || shards[0] === file.metadata.originalURL;
        if (isFirstShard) {
          models.push(
            new Model(this, file.metadata.originalURL, mmprojUrl, cachedFiles)
          );
        }
      }
      if (!opts.includeInvalid) {
        models = models.filter(
          (m) => m.validate() === "valid" /* VALID */
        );
      }
      return models;
    });
  }
  /**
   * Download a model from the given URL.
   *
   * The URL must end with `.gguf`
   */
  downloadModel(_0) {
    return __async(this, arguments, function* (sourceOrURL, options = {}) {
      const source = isString(sourceOrURL) ? { url: sourceOrURL } : sourceOrURL;
      if (!isValidGgufFile(source.url)) {
        throw new WllamaError(
          `Invalid model URL: ${source.url}; URL must ends with ".gguf"`,
          "download_error"
        );
      }
      const model = new Model(this, source.url, source.mmprojUrl);
      const validity = model.validate();
      if (validity !== "valid" /* VALID */) {
        yield model.refresh(options);
      }
      return model;
    });
  }
  /**
   * Get a model from the cache or download it if it's not available.
   */
  getModelOrDownload(_0) {
    return __async(this, arguments, function* (source, options = {}) {
      var _a;
      const models = yield this.getModels();
      const model = models.find((m) => m.url === source.url);
      if (model) {
        (_a = options.progressCallback) == null ? void 0 : _a.call(options, { loaded: model.size, total: model.size });
        return model;
      }
      return this.downloadModel(source, options);
    });
  }
  /**
   * Remove all models from the cache
   */
  clear() {
    return __async(this, null, function* () {
      yield this.cacheManager.clear();
    });
  }
};

// src/types/types.ts
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["DEBUG"] = 1] = "DEBUG";
  LogLevel2[LogLevel2["INFO"] = 2] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 3] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 4] = "ERROR";
  return LogLevel2;
})(LogLevel || {});

// src/wasm-from-cdn.ts
var WasmCompatFromCDN = {
  worker: "https://cdn.jsdelivr.net/npm/@wllama/wllama-compat@3.7.0/wasm/wllama.js",
  wasm: "https://cdn.jsdelivr.net/npm/@wllama/wllama-compat@3.7.0/wasm/wllama.wasm"
};

// src/wllama.ts
var LoggerWithoutDebug = __spreadProps(__spreadValues({}, console), {
  debug: () => {
  }
});
var WllamaError = class extends Error {
  constructor(message, type = "unknown_error") {
    super(message);
    __publicField(this, "type");
    this.type = type;
  }
};
var WllamaAbortError = class extends Error {
  constructor() {
    super("Operation aborted");
    __publicField(this, "name", "AbortError");
  }
};
var WllamaRuntimeError = class extends Error {
  constructor(message, stack) {
    super(message);
    __publicField(this, "name", "RuntimeError");
    __publicField(this, "stack");
    this.stack = stack;
  }
};
var Wllama = class {
  constructor(pathConfig, wllamaConfig = {}) {
    // The CacheManager and ModelManager are singleton, can be accessed by user
    __publicField(this, "cacheManager");
    __publicField(this, "modelManager");
    __publicField(this, "compat", null);
    __publicField(this, "proxy", null);
    __publicField(this, "config");
    __publicField(this, "pathConfig");
    __publicField(this, "useMultiThread", false);
    __publicField(this, "nbThreads", 1);
    __publicField(this, "useEmbeddings", false);
    __publicField(this, "useRerank", false);
    // available when loaded
    __publicField(this, "loadedContextInfo", null);
    __publicField(this, "seed");
    __publicField(this, "bosToken", -1);
    __publicField(this, "eosToken", -1);
    __publicField(this, "eotToken", -1);
    __publicField(this, "eogTokens", /* @__PURE__ */ new Set());
    __publicField(this, "addBosToken", false);
    __publicField(this, "addEosToken", false);
    __publicField(this, "mediaMarker");
    __publicField(this, "chatTemplate");
    __publicField(this, "metadata");
    __publicField(this, "hasEncoder", false);
    __publicField(this, "decoderStartToken", -1);
    // note: we overlay instead of using llama-server default_template_kwargs, because we cannot transfer complex data structure via GLUE
    // overlay allow mixed data type or nested structure for kwargs
    __publicField(this, "chatTemplateKwargs", {});
    var _a, _b, _c;
    checkEnvironmentCompatible();
    if (!pathConfig) throw new WllamaError("AssetsPathConfig is required");
    this.pathConfig = pathConfig;
    this.config = wllamaConfig;
    this.cacheManager = (_a = wllamaConfig.cacheManager) != null ? _a : new cache_manager_default();
    this.modelManager = (_c = wllamaConfig.modelManager) != null ? _c : new ModelManager({
      cacheManager: this.cacheManager,
      logger: (_b = wllamaConfig.logger) != null ? _b : console,
      parallelDownloads: wllamaConfig.parallelDownloads,
      allowOffline: wllamaConfig.allowOffline
    });
    this.setCompat("default");
  }
  logger() {
    var _a;
    return (_a = this.config.logger) != null ? _a : console;
  }
  checkModelLoaded() {
    if (!this.isModelLoaded()) {
      throw new WllamaError(
        "loadModel() is not yet called",
        "model_not_loaded"
      );
    }
  }
  /**
   * Get the libllama version string, e.g. "b6327-4d74393".
   *
   * @returns version string embedded at build time.
   */
  static getLibllamaVersion() {
    return LIBLLAMA_VERSION;
  }
  /**
   * Set compatibility options for Wllama.
   * @param compat Set to null to disable compatibility, or 'default' to use the default compat resources from CDN.
   * @param mode 'safari' by default; If set to 'firefox_safari', the compat mode will **also** be enabled on Firefox, which will significantly degrade the performance but allow using WebGPU on Firefox.
   */
  setCompat(compat, mode = "safari") {
    if (mode === "safari") {
      if (isFirefox()) {
        this.compat = null;
        return;
      }
    }
    this.compat = compat === "default" ? WasmCompatFromCDN : compat;
  }
  /**
   * Check if the model is loaded via `loadModel()`
   */
  isModelLoaded() {
    return !!this.proxy && !!this.metadata;
  }
  /**
   * Get token ID associated to BOS (begin of sentence) token.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns -1 if the model is not loaded.
   */
  getBOS() {
    return this.bosToken;
  }
  /**
   * Get token ID associated to EOS (end of sentence) token.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns -1 if the model is not loaded.
   */
  getEOS() {
    return this.eosToken;
  }
  /**
   * Get token ID associated to EOT (end of turn) token.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns -1 if the model is not loaded.
   */
  getEOT() {
    return this.eotToken;
  }
  /**
   * Check if a given token is end-of-generation token (e.g. EOS, EOT, etc.)
   *
   * @param token the token ID to be checked
   * @returns true if the token is EOS, EOT, or any other end-of-generation tokens
   */
  isTokenEOG(token) {
    return token === this.eosToken || token === this.eotToken || this.eogTokens.has(token);
  }
  /**
   * Get token ID associated to token used by decoder, to start generating output sequence(only usable for encoder-decoder architecture). In other words, encoder uses normal BOS and decoder uses this token.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns -1 if the model is not loaded.
   */
  getDecoderStartToken() {
    return this.decoderStartToken;
  }
  /**
   * Get model hyper-parameters and metadata
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns ModelMetadata
   */
  getModelMetadata() {
    this.checkModelLoaded();
    return this.metadata;
  }
  /**
   * Check if we're currently using multi-thread build.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns true if multi-thread is used.
   */
  isMultithread() {
    this.checkModelLoaded();
    return this.useMultiThread;
  }
  /**
   * Get number of threads used in the current context.
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns number of threads
   */
  getNumThreads() {
    this.checkModelLoaded();
    return this.useMultiThread ? this.nbThreads : 1;
  }
  /**
   * Check if the current model uses encoder-decoder architecture
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns true if multi-thread is used.
   */
  isEncoderDecoderArchitecture() {
    this.checkModelLoaded();
    return this.hasEncoder;
  }
  /**
   * Must we add BOS token to the tokenized sequence?
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns true if BOS token must be added to the sequence
   */
  mustAddBosToken() {
    this.checkModelLoaded();
    return this.addBosToken;
  }
  /**
   * Must we add EOS token to the tokenized sequence?
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns true if EOS token must be added to the sequence
   */
  mustAddEosToken() {
    this.checkModelLoaded();
    return this.addEosToken;
  }
  /**
   * Get the jinja chat template comes with the model. It only available if the original model (before converting to gguf) has the template in `tokenizer_config.json`
   *
   * NOTE: This can only being used after `loadModel` is called.
   *
   * @returns the jinja template. null if there is no template in gguf
   */
  getChatTemplate() {
    var _a;
    this.checkModelLoaded();
    return (_a = this.chatTemplate) != null ? _a : null;
  }
  /**
   * Check if WebGPU is supported by the current environment.
   * @returns true if WebGPU is supported
   */
  isSupportWebGPU() {
    return isSupportWebGPU();
  }
  /**
   * Load model from a given URL (or a list of URLs, in case the model is splitted into smaller files)
   * - If the model already been downloaded (via `downloadModel()`), then we will use the cached model
   * - Else, we download the model from internet
   * @param modelSourceOrURL
   * @param params
   */
  loadModelFromUrl(_0) {
    return __async(this, arguments, function* (modelSourceOrURL, params = {}) {
      var _a;
      const source = isString(modelSourceOrURL) ? { url: modelSourceOrURL } : modelSourceOrURL;
      const useCache = (_a = params.useCache) != null ? _a : true;
      const model = useCache ? yield this.modelManager.getModelOrDownload(source, params) : yield this.modelManager.downloadModel(source, params);
      const blobs = yield model.open();
      return yield this.loadModel(blobs, params);
    });
  }
  /**
   * Load model from a given Hugging Face model ID and file path.
   *
   * @param hfOptions
   * @param params
   */
  loadModelFromHF(_0) {
    return __async(this, arguments, function* (hfOptions, params = {}) {
      const source = yield getHFModelSource(hfOptions);
      return yield this.loadModelFromUrl(source, params);
    });
  }
  /**
   * Load model from a given list of Blob.
   *
   * You can pass multiple buffers into the function (in case the model contains multiple shards).
   *
   * @param ggufBlobsOrModel Can be either list of Blobs (in case you use local file), or a Model object (in case you use ModelManager)
   * @param params LoadModelParams
   */
  loadModel(_0) {
    return __async(this, arguments, function* (ggufBlobsOrModel, params = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const blobs = ggufBlobsOrModel instanceof Model ? yield ggufBlobsOrModel.open() : [...ggufBlobsOrModel];
      if (blobs.some((b) => b.size === 0)) {
        throw new WllamaError(
          "Input model (or splits) must be non-empty Blob or File",
          "load_error"
        );
      }
      if (!this.pathConfig["default"]) {
        throw new WllamaError(
          '"default" is missing from pathConfig',
          "load_error"
        );
      }
      if (this.proxy) {
        throw new WllamaError("Module is already initialized", "load_error");
      }
      const supportMultiThread = yield isSupportMultiThread();
      const hwConccurency = Math.floor((navigator.hardwareConcurrency || 1) / 2);
      const nbThreads = (_a = params.n_threads) != null ? _a : hwConccurency;
      this.nbThreads = nbThreads;
      this.useMultiThread = supportMultiThread && nbThreads > 1;
      const workerResources = this.getWorkerResources();
      if (params.n_gpu_layers === 0) {
        workerResources.noWebGPU = true;
      }
      this.proxy = new ProxyToWorker(
        workerResources,
        this.useMultiThread ? nbThreads : 0,
        // 0 means disable pthread
        (_b = this.config.suppressNativeLog) != null ? _b : false,
        this.logger()
      );
      let logLevel = (_c = params.log_level) != null ? _c : 2 /* INFO */;
      if (this.config.suppressNativeLog) {
        logLevel = 9999;
      }
      const modelFiles = yield prepareBlobs(blobs);
      yield this.proxy.moduleInit(modelFiles.all);
      this.logger().debug("Calling wllamaStart...");
      const startResult = yield this.proxy.wllamaStart();
      if (!startResult.success) {
        throw new WllamaError(
          `Error while calling start function, result = ${startResult}`
        );
      }
      this.logger().debug("Loading model...");
      const loadResult = yield this.proxy.wllamaAction("load", {
        _name: "load_req",
        log_level: logLevel,
        // if async read is not supported, use mmap; refer to README-dev.md for more details
        use_mmap: !canUseAsyncFileRead(workerResources.compat),
        use_mlock: false,
        n_gpu_layers: (_d = params.n_gpu_layers) != null ? _d : 99999,
        n_ctx: (_e = params.n_ctx) != null ? _e : 1024,
        n_threads: this.useMultiThread ? nbThreads : 1,
        n_ctx_auto: false,
        // not supported for now
        mmproj_path: modelFiles.mmproj ? `/models/${MMPROJ_FILE_NAME}` : void 0,
        model_paths: modelFiles.llm.map((f) => `models/${f.name}`),
        embeddings: params.embeddings,
        offload_kqv: params.offload_kqv,
        n_batch: params.n_batch,
        n_ubatch: params.n_ubatch,
        pooling_type: params.pooling_type,
        rope_scaling_type: params.rope_scaling_type,
        rope_freq_base: params.rope_freq_base,
        rope_freq_scale: params.rope_freq_scale,
        yarn_ext_factor: params.yarn_ext_factor,
        yarn_attn_factor: params.yarn_attn_factor,
        yarn_beta_fast: params.yarn_beta_fast,
        yarn_beta_slow: params.yarn_beta_slow,
        yarn_orig_ctx: params.yarn_orig_ctx,
        cache_type_k: params.cache_type_k,
        cache_type_v: params.cache_type_v,
        // with unified KV, all sequences share one n_ctx cache, so each request can still use the full context
        n_parallel: (_f = params.n_parallel) != null ? _f : 4,
        kv_unified: (_g = params.kv_unified) != null ? _g : true,
        flash_attn: params.flash_attn,
        swa_full: params.swa_full,
        chat_template: params.chat_template,
        jinja: params.jinja,
        reasoning: params.reasoning,
        image_min_tokens: params.image_min_tokens,
        image_max_tokens: params.image_max_tokens,
        warmup: params.warmup,
        no_kv_offload: params.no_kv_offload,
        mmproj_offload: params.mmproj_offload,
        cont_batching: params.cont_batching,
        n_keep: params.n_keep,
        ctx_shift: params.ctx_shift,
        cache_idle_slots: params.cache_idle_slots,
        n_cache_reuse: params.n_cache_reuse,
        lora_paths: (_h = params.lora_adapters) == null ? void 0 : _h.map((a) => a.path),
        lora_scales: (_i = params.lora_adapters) == null ? void 0 : _i.map((a) => {
          var _a2;
          return (_a2 = a.scale) != null ? _a2 : 1;
        }),
        lora_init_without_apply: params.lora_init_without_apply,
        spec_draft_model: params.spec_draft_model,
        spec_draft_ngl: params.spec_draft_ngl,
        spec_draft_n_max: params.spec_draft_n_max,
        spec_draft_n_min: params.spec_draft_n_min,
        spec_draft_p_min: params.spec_draft_p_min,
        spec_draft_threads: params.spec_draft_threads,
        spec_draft_threads_batch: params.spec_draft_threads_batch,
        kv_overrides_keys: params.kv_overrides ? Object.keys(params.kv_overrides) : void 0,
        kv_overrides_vals: params.kv_overrides ? Object.values(params.kv_overrides) : void 0,
        reasoning_budget_tokens: params.reasoning_budget_tokens,
        reasoning_budget_message: params.reasoning_budget_message,
        reasoning_format: params.reasoning_format,
        skip_chat_parsing: params.skip_chat_parsing,
        prefill_assistant: params.prefill_assistant
      });
      const loadedCtxInfo = __spreadProps(__spreadValues({}, loadResult), {
        metadata: {}
      });
      for (let i = 0; i < loadResult.metadata_key.length; i++) {
        loadedCtxInfo.metadata[loadResult.metadata_key[i]] = loadResult.metadata_val[i];
      }
      this.seed = params.seed;
      this.bosToken = loadedCtxInfo.token_bos;
      this.eosToken = loadedCtxInfo.token_eos;
      this.eotToken = loadedCtxInfo.token_eot;
      this.useEmbeddings = !!params.embeddings;
      this.useRerank = params.pooling_type == "rank";
      this.metadata = {
        hparams: {
          nVocab: loadedCtxInfo.n_vocab,
          nCtxTrain: loadedCtxInfo.n_ctx_train,
          nEmbd: loadedCtxInfo.n_embd,
          nLayer: loadedCtxInfo.n_layer
        },
        meta: loadedCtxInfo.metadata
      };
      this.hasEncoder = !!loadedCtxInfo.has_encoder;
      this.decoderStartToken = loadedCtxInfo.token_decoder_start;
      this.addBosToken = loadedCtxInfo.add_bos_token;
      this.addEosToken = loadedCtxInfo.add_eos_token;
      this.chatTemplate = loadedCtxInfo.metadata["tokenizer.chat_template"];
      this.loadedContextInfo = loadedCtxInfo;
      this.eogTokens = new Set(loadedCtxInfo.list_tokens_eog);
      this.mediaMarker = loadedCtxInfo.media_marker;
      this.chatTemplateKwargs = (_j = params.default_template_kwargs) != null ? _j : {};
      this.logger().debug({ loadedCtxInfo });
    });
  }
  getLoadedContextInfo() {
    this.checkModelLoaded();
    if (!this.loadedContextInfo) {
      throw new WllamaError("Loaded context info is not available");
    }
    return __spreadValues({}, this.loadedContextInfo);
  }
  //////////////////////////////////////////////
  // High level API
  /**
   * Calculate embedding vector for a given text.
   * By default, BOS and EOS tokens will be added automatically. You can use the "skipBOS" and "skipEOS" option to disable it.
   * @param options OAI-compatible embedding creation options
   * @returns OAI-compatible embedding response
   */
  createEmbedding(options) {
    return __async(this, null, function* () {
      this.checkModelLoaded();
      if (!this.useEmbeddings) {
        throw new WllamaError(
          "Embeddings is not enabled. Please set it via LoadModelParams.embeddings"
        );
      }
      const result = yield this.proxy.wllamaAction(
        "embedding",
        {
          _name: "embd_req",
          data_json: JSON.stringify(options),
          files: []
          // TODO: support file input
        }
      );
      if (!result.success) {
        throw new WllamaError(
          "Model failed to start inference",
          "inference_error"
        );
      }
      return yield this.getResponse(options, false, result.req_id);
    });
  }
  /**
   * Feed tokens into the KV cache one llama_decode call at a time and return the full logit row of the last one.
   * Uses the loaded model's context directly, so do not mix it with createCompletion on the same model.
   * @param tokens Token ids to evaluate in order; pass [] with reset to only clear the cache
   * @param options reset: clear the KV cache before evaluating
   * @returns nPast (tokens now in the cache) and the logits, empty when no token was given
   */
  rawEval(_0) {
    return __async(this, arguments, function* (tokens, options = {}) {
      this.checkModelLoaded();
      const result = yield this.proxy.wllamaAction("raw_eval", {
        _name: "revl_req",
        reset: !!options.reset,
        tokens
      });
      if (!result.success) {
        throw new WllamaError("raw_eval failed", "inference_error");
      }
      const bytes = result.logits.slice();
      return {
        nPast: result.n_past,
        logits: new Float32Array(bytes.buffer, 0, bytes.byteLength / 4)
      };
    });
  }
  /**
   * Slide the KV cache: keep the first nKeep positions, drop the next nDiscard,
   * and shift the rest back. A writer and a reader that make the same calls in
   * the same order keep identical logits, which is what a windowed watermark needs.
   * @returns nPast (tokens now in the cache)
   */
  kvShift(options) {
    return __async(this, null, function* () {
      this.checkModelLoaded();
      const result = yield this.proxy.wllamaAction("kv_shift", {
        _name: "kvsh_req",
        n_keep: options.nKeep,
        n_discard: options.nDiscard
      });
      if (!result.success) {
        throw new WllamaError("kv_shift failed", "inference_error");
      }
      return { nPast: result.n_past };
    });
  }
  /**
   * Tokenize text with the loaded model's own tokenizer. No BOS is added.
   * @param text
   * @param special Parse special token strings (e.g. <|im_end|>) as special tokens
   */
  tokenize(text, special = false) {
    return __async(this, null, function* () {
      this.checkModelLoaded();
      const result = yield this.proxy.wllamaAction("tokenize", {
        _name: "tokn_req",
        text,
        special
      });
      if (!result.success) {
        throw new WllamaError("tokenize failed", "inference_error");
      }
      return result.tokens;
    });
  }
  /**
   * Turn tokens back into bytes with the loaded model's own tokenizer.
   * @param tokens
   * @param special Render special tokens as text instead of dropping them
   */
  detokenize(tokens, special = false) {
    return __async(this, null, function* () {
      this.checkModelLoaded();
      const result = yield this.proxy.wllamaAction("detokenize", {
        _name: "dtkn_req",
        tokens,
        special
      });
      if (!result.success) {
        throw new WllamaError("detokenize failed", "inference_error");
      }
      return result.text;
    });
  }
  /**
   * The whole vocabulary as byte pieces, plus the end-of-generation token ids, in one call.
   * @param special Render special tokens as text instead of empty pieces
   */
  getVocab(special = false) {
    return __async(this, null, function* () {
      this.checkModelLoaded();
      const result = yield this.proxy.wllamaAction("vocab", {
        _name: "vocb_req",
        special
      });
      if (!result.success) {
        throw new WllamaError("vocab failed", "inference_error");
      }
      return {
        nVocab: result.n_vocab,
        tokenEos: result.token_eos,
        listTokensEog: result.list_tokens_eog,
        pieces: result.pieces
      };
    });
  }
  /**
   * Rerank a list of documents against a query.
   * Requires the model to be loaded with embeddings: true and pooling_type: 'rank'.
   * @param options Reranking options (query, documents, top_n)
   * @returns Reranking response with relevance scores sorted highest first
   */
  createRerank(options) {
    return __async(this, null, function* () {
      var _a, _b;
      this.checkModelLoaded();
      if (!this.useEmbeddings || !this.useRerank) {
        throw new WllamaError(
          "Rerank is not enabled. Please set it via LoadModelParams: embeddings = true and pooling_type = rank"
        );
      }
      const top_n = (_a = options.top_n) != null ? _a : options.documents.length;
      let totalTokens = 0;
      const rawResults = [];
      for (let i = 0; i < options.documents.length; i++) {
        const result = yield this.proxy.wllamaAction("rerank", {
          _name: "rrnk_req",
          data_json: JSON.stringify({
            query: options.query,
            document: options.documents[i]
          })
        });
        if (!result.success) {
          throw new WllamaError(
            "Model failed to start reranking",
            "inference_error"
          );
        }
        const { score, tokens_evaluated } = yield this.getRerankResult(
          result.req_id
        );
        totalTokens += tokens_evaluated;
        rawResults.push({ index: i, score });
      }
      rawResults.sort((a, b) => b.score - a.score);
      return {
        model: (_b = this.getModelMetadata().meta["general.name"]) != null ? _b : "",
        object: "list",
        usage: { prompt_tokens: totalTokens, total_tokens: totalTokens },
        results: rawResults.slice(0, top_n).map(({ index, score }) => ({
          index,
          relevance_score: score
        }))
      };
    });
  }
  createChatCompletion(options) {
    return __async(this, null, function* () {
      var _a;
      if (Object.keys(this.chatTemplateKwargs).length > 0) {
        options = __spreadProps(__spreadValues({}, options), {
          chat_template_kwargs: __spreadValues(__spreadValues({}, this.chatTemplateKwargs), (_a = options.chat_template_kwargs) != null ? _a : {})
        });
      }
      if (options.stream && options.onData) {
        yield this.createCompletionImpl(options);
      } else if (options.stream) {
        return yield this.createCompletionGenerator(options);
      } else {
        return yield this.createCompletionImpl(__spreadProps(__spreadValues({}, options), { stream: false }));
      }
    });
  }
  createCompletion(options) {
    return __async(this, null, function* () {
      if (options.stream && options.onData) {
        yield this.createCompletionImpl(options);
      } else if (options.stream) {
        return yield this.createCompletionGenerator(options);
      } else {
        return yield this.createCompletionImpl(__spreadProps(__spreadValues({}, options), { stream: false }));
      }
    });
  }
  /**
   * Private implementation of createCompletion
   */
  createCompletionImpl(options) {
    return __async(this, null, function* () {
      this.checkModelLoaded();
      const isStream = !!options.stream;
      const isChat = !!options.messages;
      const customOpt = {};
      if (this.seed !== void 0) {
        customOpt.seed = this.seed;
      }
      let files = [];
      if (isChat) {
        const tmp = this.prepareMultimodalInput(
          options
        );
        options = tmp.params;
        files = tmp.files;
      }
      const result = yield this.proxy.wllamaAction(
        "completion",
        {
          _name: "cmpl_req",
          is_chat: isChat,
          data_json: JSON.stringify(__spreadValues(__spreadValues({}, options), customOpt)),
          files: files.map((f) => new Uint8Array(f))
        }
      );
      if (!result.success) {
        throw new WllamaError(
          "Model failed to start inference",
          "inference_error"
        );
      }
      return yield this.getResponse(
        options,
        isStream,
        result.req_id
      );
    });
  }
  /**
   * Same with `createCompletion`, but returns an async iterator instead.
   * Only called when stream=true and no onData is provided.
   */
  createCompletionGenerator(options) {
    return new Promise((resolve) => {
      const createGenerator = cbToAsyncIter(
        (callback) => {
          this.createCompletionImpl(__spreadProps(__spreadValues({}, options), {
            onData: (chunk) => callback(chunk)
          })).then(() => callback(void 0, true)).catch((err) => callback(void 0, false, err));
        }
      );
      resolve(createGenerator());
    });
  }
  /**
   * Whether the currently loaded model supports a specific input modality (e.g. image or audio).
   * @param modality
   * @returns
   */
  supportInputModality(modality) {
    this.checkModelLoaded();
    if (modality === "image") {
      return !!this.loadedContextInfo.has_image_input;
    } else if (modality === "audio") {
      return !!this.loadedContextInfo.has_audio_input;
    } else {
      throw new WllamaError(
        "Unsupported modality: " + modality,
        "unknown_error"
      );
    }
  }
  /**
   * Unload the model and free all memory.
   *
   * Note: This function will NOT crash if model is not yet loaded
   */
  exit() {
    return __async(this, null, function* () {
      var _a;
      yield (_a = this.proxy) == null ? void 0 : _a.wllamaExit();
      this.proxy = null;
    });
  }
  /**
   * [FOR DEBUGGING ONLY] Run ggml backend ops tests without loading any model.
   *
   * Initializes the wasm runtime, executes `test-backend-ops` with the given args, then shuts down.
   *
   * For more info, please refer to guides/debug.md
   *
   * @param args Arguments forwarded to test-backend-ops (e.g. ["-o", "ADD"])
   * @returns retcode (0 = all tests passed) and success flag
   */
  testBackendOps() {
    return __async(this, arguments, function* (args = []) {
      var _a;
      if (!this.pathConfig["default"]) {
        throw new WllamaError(
          '"default" is missing from pathConfig',
          "load_error"
        );
      }
      if (!(yield isSupportMultiThread())) {
        throw new WllamaError(
          "Multi-threading is required to run backend ops tests, but it is not supported in the current environment."
        );
      }
      const tmpProxy = new ProxyToWorker(
        this.getWorkerResources(),
        0,
        // single-thread; no model needed
        (_a = this.config.suppressNativeLog) != null ? _a : false,
        this.logger()
      );
      try {
        yield tmpProxy.moduleInit([]);
        const startResult = yield tmpProxy.wllamaStart();
        if (!startResult.success) {
          throw new WllamaError(
            `Error while calling start function, result = ${startResult}`
          );
        }
        const result = yield tmpProxy.wllamaAction(
          "test_backend_ops",
          { _name: "tbop_req", args: ["test-backend-ops", ...args] }
        );
        return { retcode: result.retcode, success: result.success };
      } finally {
        yield tmpProxy.wllamaExit();
      }
    });
  }
  //////////////////////////////////////////////
  // Low level API
  // TODO: add back
  /**
   * get debug info
   */
  _getDebugInfo() {
    return __async(this, null, function* () {
      this.checkModelLoaded();
      return yield this.proxy.wllamaDebug();
    });
  }
  //////////////////////////////////////////////
  // Utils
  jsonDecode(data_json) {
    try {
      return JSON.parse(data_json);
    } catch (e) {
      this.logger().error("Failed to parse JSON:", data_json);
      throw new WllamaError("Failed to parse model output", "inference_error");
    }
  }
  prepareMultimodalInput(params) {
    const msg = params.messages;
    const msgNew = [];
    const files = [];
    for (const m of msg) {
      if (Array.isArray(m.content)) {
        const newContent = [];
        for (const c of m.content) {
          if (c.type === "text") {
            newContent.push(c);
          } else {
            if (!this.mediaMarker) {
              throw new WllamaError(
                "Media marker is undefined",
                "inference_error"
              );
            }
            files.push(c.data);
            newContent.push({
              type: "text",
              text: this.mediaMarker
            });
          }
        }
        msgNew.push(__spreadProps(__spreadValues({}, m), {
          content: newContent
        }));
      } else {
        msgNew.push(m);
      }
    }
    return {
      params: __spreadProps(__spreadValues({}, params), {
        messages: msgNew
      }),
      files
    };
  }
  // release the slot occupied by the request; cancelling an already-finished request is a no-op
  cancelRequest(reqId) {
    return __async(this, null, function* () {
      try {
        yield this.proxy.wllamaAction("cancel", {
          _name: "cncl_req",
          req_id: reqId
        });
      } catch (e) {
        this.logger().warn("Failed to cancel request", reqId, e);
      }
    });
  }
  getRerankResult(reqId) {
    return __async(this, null, function* () {
      let completed = false;
      try {
        while (true) {
          const chunk = yield this.proxy.wllamaAction(
            "get_result",
            { _name: "gres_req", req_id: reqId }
          );
          const jsonString = chunk.data_json;
          if (jsonString && jsonString.length > 0) {
            if (chunk.is_error) {
              const jsonData = this.jsonDecode(jsonString);
              throw new WllamaError(
                jsonData.message || "Unknown reranking error",
                "inference_error"
              );
            }
            completed = true;
            return this.jsonDecode(jsonString);
          }
          if (!chunk.has_more) {
            completed = true;
            break;
          }
        }
        throw new WllamaError("No reranking result received", "inference_error");
      } finally {
        if (!completed) {
          yield this.cancelRequest(reqId);
        }
      }
    });
  }
  getResponse(options, isStream, reqId) {
    return __async(this, null, function* () {
      var _a, _b;
      let finalResult = null;
      let completed = false;
      try {
        while (true) {
          if ((_a = options.abortSignal) == null ? void 0 : _a.aborted) {
            throw new WllamaAbortError();
          }
          const result_chunk = yield this.proxy.wllamaAction(
            "get_result",
            {
              _name: "gres_req",
              req_id: reqId
            }
          );
          const jsonString = result_chunk.data_json;
          if (!jsonString || jsonString.length === 0) {
            if (!result_chunk.has_more) {
              completed = true;
              break;
            } else {
              continue;
            }
          }
          if (jsonString == "null") {
            continue;
          }
          let jsonData = this.jsonDecode(jsonString);
          finalResult = jsonData;
          if (result_chunk.is_error) {
            this.logger().error("Model returned an error:", jsonData);
            throw new WllamaError(
              jsonData.message || "Unknown inference error",
              "inference_error"
            );
          }
          if (isStream) {
            if (!Array.isArray(jsonData)) {
              jsonData = [jsonData];
            }
            for (const chunk of jsonData) {
              (_b = options.onData) == null ? void 0 : _b.call(options, chunk);
              finalResult = chunk;
            }
          }
          if (!result_chunk.has_more) {
            completed = true;
            break;
          }
        }
      } finally {
        if (!completed) {
          yield this.cancelRequest(reqId);
        }
      }
      return finalResult;
    });
  }
  getWorkerResources() {
    const workerResources = {
      wasmPath: absoluteUrl(this.pathConfig["default"]),
      compat: false
    };
    if (needCompat()) {
      if (!this.compat) {
        this.logger().warn(
          "Not using compat mode" + (isFirefox() ? " (expected on Firefox - WebGPU will be disabled)" : "")
        );
      } else {
        const isUsingDefault = this.compat.worker === WasmCompatFromCDN.worker && this.compat.wasm === WasmCompatFromCDN.wasm;
        if (isUsingDefault) {
          this.logger().warn(
            "Compatibility mode is activated, using resources from CDN. To use local resources, please refer to @wllama/wllama-compat package."
          );
          this.logger().warn(
            "IMPORTANT: Performance will be significantly degraded in compatibility mode."
          );
        }
        workerResources.wasmPath = absoluteUrl(this.compat.wasm);
        workerResources.jsPath = this.compat.worker;
        workerResources.compat = true;
      }
    }
    if (isFirefox()) {
      if (workerResources.compat) {
        this.logger().warn(
          'Using compat mode on Firefox, performance will be significantly degraded; Consider enabling "javascript.options.wasm_js_promise_integration" in "about:config".'
        );
      } else if (!isSupportJSPI()) {
        this.logger().warn(
          'WebGPU is disabled on Firefox due to missing JSPI support. Please consider enabling compat mode, or enabling "javascript.options.wasm_js_promise_integration" in "about:config".'
        );
      }
    }
    return workerResources;
  }
};
export {
  CacheManager,
  LogLevel,
  LoggerWithoutDebug,
  Model,
  ModelManager,
  ModelValidationStatus,
  POLYFILL_ETAG,
  Wllama,
  WllamaAbortError,
  WllamaError,
  WllamaRuntimeError,
  getHFFileSHA256,
  getHFModelSource,
  isValidGgufFile
};
