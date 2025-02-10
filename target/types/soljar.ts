/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/soljar.json`.
 */
export type Soljar = {
  "address": "APfu475CVFEop5CJbpRW9c2sbpbvvQmtixsTfe27pN7g",
  "metadata": {
    "name": "soljar",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createDepositIndex",
      "discriminator": [
        93,
        55,
        71,
        41,
        97,
        23,
        11,
        207
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "jar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "index",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "account",
                "path": "jar"
              }
            ]
          }
        },
        {
          "name": "depositIndex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116,
                  95,
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "account",
                "path": "index"
              },
              {
                "kind": "account",
                "path": "index.deposit_index_page",
                "account": "index"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createIndexes",
      "discriminator": [
        120,
        209,
        231,
        89,
        145,
        140,
        13,
        193
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "jar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "index",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "account",
                "path": "jar"
              }
            ]
          }
        },
        {
          "name": "depositIndex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  111,
                  115,
                  105,
                  116,
                  95,
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "account",
                "path": "index"
              },
              {
                "kind": "const",
                "value": [
                  48
                ]
              }
            ]
          }
        },
        {
          "name": "withdrawlIndex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  105,
                  116,
                  104,
                  100,
                  114,
                  97,
                  119,
                  108,
                  95,
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "account",
                "path": "index"
              },
              {
                "kind": "const",
                "value": [
                  48
                ]
              }
            ]
          }
        },
        {
          "name": "metaIndex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  95,
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "account",
                "path": "index"
              },
              {
                "kind": "const",
                "value": [
                  48
                ]
              }
            ]
          }
        },
        {
          "name": "tipLinkIndex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  95,
                  108,
                  105,
                  110,
                  107,
                  95,
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "account",
                "path": "index"
              },
              {
                "kind": "const",
                "value": [
                  48
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createTipLink",
      "discriminator": [
        62,
        173,
        19,
        0,
        138,
        53,
        189,
        20
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "jar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "index",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "account",
                "path": "jar"
              }
            ]
          }
        },
        {
          "name": "tipLinkIndex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  95,
                  108,
                  105,
                  110,
                  107,
                  95,
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "account",
                "path": "index"
              },
              {
                "kind": "const",
                "value": [
                  48
                ]
              }
            ]
          }
        },
        {
          "name": "tipLink",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  105,
                  112,
                  95,
                  108,
                  105,
                  110,
                  107
                ]
              },
              {
                "kind": "account",
                "path": "index"
              },
              {
                "kind": "const",
                "value": [
                  48
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "createUser",
      "discriminator": [
        108,
        227,
        130,
        130,
        252,
        109,
        75,
        218
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "jar",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  97,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "index",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  100,
                  101,
                  120
                ]
              },
              {
                "kind": "account",
                "path": "jar"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "depositIndex",
      "discriminator": [
        56,
        236,
        229,
        13,
        113,
        72,
        90,
        142
      ]
    },
    {
      "name": "index",
      "discriminator": [
        140,
        66,
        194,
        132,
        78,
        26,
        135,
        186
      ]
    },
    {
      "name": "jar",
      "discriminator": [
        197,
        50,
        234,
        142,
        247,
        216,
        114,
        137
      ]
    },
    {
      "name": "metaIndex",
      "discriminator": [
        241,
        40,
        192,
        50,
        17,
        120,
        10,
        53
      ]
    },
    {
      "name": "tipLink",
      "discriminator": [
        197,
        93,
        252,
        135,
        16,
        11,
        146,
        202
      ]
    },
    {
      "name": "tipLinkIndex",
      "discriminator": [
        254,
        119,
        238,
        213,
        125,
        13,
        253,
        15
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    },
    {
      "name": "withdrawlIndex",
      "discriminator": [
        66,
        186,
        158,
        34,
        20,
        214,
        95,
        50
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "overflow",
      "msg": "overflow"
    },
    {
      "code": 6001,
      "name": "noChanges",
      "msg": "noChangesDetected"
    },
    {
      "code": 6002,
      "name": "usernameTooLong",
      "msg": "usernameTooLong"
    },
    {
      "code": 6003,
      "name": "usernameAlreadyExists",
      "msg": "usernameAlreadyExists"
    }
  ],
  "types": [
    {
      "name": "depositIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "indexKey",
            "type": "pubkey"
          },
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "totalItems",
            "type": "u64"
          },
          {
            "name": "deposits",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "index",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userKey",
            "type": "pubkey"
          },
          {
            "name": "jarKey",
            "type": "pubkey"
          },
          {
            "name": "depositIndexPage",
            "type": "u32"
          },
          {
            "name": "withdrawlIndexPage",
            "type": "u32"
          },
          {
            "name": "metaIndexPage",
            "type": "u32"
          },
          {
            "name": "tipLinkIndexPage",
            "type": "u32"
          },
          {
            "name": "totalDeposits",
            "type": "u32"
          },
          {
            "name": "totalWithdrawls",
            "type": "u32"
          },
          {
            "name": "totalMetas",
            "type": "u32"
          },
          {
            "name": "totalTipLinks",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "jar",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userKey",
            "type": "pubkey"
          },
          {
            "name": "indexKey",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "balances",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "metaIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "indexKey",
            "type": "pubkey"
          },
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "totalItems",
            "type": "u64"
          },
          {
            "name": "metas",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "tipLink",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userKey",
            "type": "pubkey"
          },
          {
            "name": "jarKey",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "tipLinkIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "indexKey",
            "type": "pubkey"
          },
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "totalItems",
            "type": "u64"
          },
          {
            "name": "tipLinks",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "receiverWallet",
            "type": "pubkey"
          },
          {
            "name": "jarKey",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "withdrawlIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "indexKey",
            "type": "pubkey"
          },
          {
            "name": "index",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "totalItems",
            "type": "u64"
          },
          {
            "name": "withdrawls",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    }
  ]
};
