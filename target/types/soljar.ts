/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/soljar.json`.
 */
export type Soljar = {
  "address": "6kYzuEmgVUn8bmsyCDz8XuyTMVvDDVjxJj5yVSTSNo8z",
  "metadata": {
    "name": "soljar",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addSupporter",
      "discriminator": [
        37,
        136,
        43,
        131,
        3,
        221,
        114,
        11
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
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
                "kind": "arg",
                "path": "tipLinkId"
              }
            ]
          }
        },
        {
          "name": "jar",
          "writable": true,
          "relations": [
            "tipLink"
          ]
        },
        {
          "name": "index",
          "writable": true,
          "relations": [
            "jar"
          ]
        },
        {
          "name": "supporterIndex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  112,
                  112,
                  111,
                  114,
                  116,
                  101,
                  114,
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
                "path": "index.supporter_index_page",
                "account": "index"
              }
            ]
          }
        },
        {
          "name": "supporter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  112,
                  112,
                  111,
                  114,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "jar"
              },
              {
                "kind": "account",
                "path": "signer"
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
          "name": "tipLinkId",
          "type": "string"
        },
        {
          "name": "currencyMint",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createDeposit",
      "discriminator": [
        157,
        30,
        11,
        129,
        16,
        166,
        115,
        75
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
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
                "kind": "arg",
                "path": "tipLinkId"
              }
            ]
          }
        },
        {
          "name": "jar",
          "writable": true,
          "relations": [
            "tipLink"
          ]
        },
        {
          "name": "index",
          "writable": true,
          "relations": [
            "jar"
          ]
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
          "name": "deposit",
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
                  116
                ]
              },
              {
                "kind": "account",
                "path": "depositIndex"
              },
              {
                "kind": "account",
                "path": "index.total_deposits",
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
      "args": [
        {
          "name": "tipLinkId",
          "type": "string"
        },
        {
          "name": "currencyMint",
          "type": "pubkey"
        },
        {
          "name": "referrer",
          "type": "string"
        },
        {
          "name": "memo",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
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
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
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
          "name": "userByName",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  110,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "username"
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
    },
    {
      "name": "createWithdrawl",
      "discriminator": [
        11,
        89,
        236,
        15,
        11,
        223,
        1,
        67
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
          },
          "relations": [
            "user"
          ]
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
                "kind": "account",
                "path": "index.withdrawl_index_page",
                "account": "index"
              }
            ]
          }
        },
        {
          "name": "withdrawl",
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
                  108
                ]
              },
              {
                "kind": "account",
                "path": "withdrawlIndex"
              },
              {
                "kind": "account",
                "path": "index.total_withdrawls",
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
      "args": [
        {
          "name": "currencyMint",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initIndexes",
      "discriminator": [
        152,
        206,
        62,
        243,
        47,
        2,
        247,
        246
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
                "kind": "arg",
                "path": "indexPage"
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
                "kind": "arg",
                "path": "indexPage"
              }
            ]
          }
        },
        {
          "name": "supporterIndex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  112,
                  112,
                  111,
                  114,
                  116,
                  101,
                  114,
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
                "kind": "arg",
                "path": "indexPage"
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
          "name": "indexPage",
          "type": "u32"
        }
      ]
    },
    {
      "name": "initPlatform",
      "discriminator": [
        29,
        22,
        210,
        225,
        219,
        114,
        193,
        169
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
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
      "name": "initTipLink",
      "discriminator": [
        43,
        221,
        12,
        232,
        145,
        122,
        3,
        74
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
          "name": "userInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  105,
                  110,
                  102,
                  111
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
                "kind": "arg",
                "path": "id"
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
        },
        {
          "name": "indexPage",
          "type": "u32"
        }
      ]
    },
    {
      "name": "transferTokens",
      "discriminator": [
        54,
        180,
        238,
        175,
        74,
        85,
        126,
        188
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
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
                "kind": "arg",
                "path": "tipLinkId"
              }
            ]
          }
        },
        {
          "name": "jar",
          "writable": true,
          "relations": [
            "tipLink"
          ]
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "jar"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "sourceTokenAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "tipLinkId",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawTokens",
      "discriminator": [
        2,
        4,
        225,
        61,
        19,
        182,
        106,
        170
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
          },
          "relations": [
            "user"
          ]
        },
        {
          "name": "mint"
        },
        {
          "name": "tokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "jar"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "associatedTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "deposit",
      "discriminator": [
        148,
        146,
        121,
        66,
        207,
        173,
        21,
        227
      ]
    },
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
      "name": "platform",
      "discriminator": [
        77,
        92,
        204,
        58,
        187,
        98,
        91,
        12
      ]
    },
    {
      "name": "supporter",
      "discriminator": [
        198,
        125,
        73,
        94,
        72,
        40,
        233,
        159
      ]
    },
    {
      "name": "supporterIndex",
      "discriminator": [
        89,
        202,
        10,
        80,
        80,
        123,
        176,
        198
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
      "name": "userByName",
      "discriminator": [
        166,
        9,
        56,
        163,
        76,
        235,
        143,
        10
      ]
    },
    {
      "name": "userInfo",
      "discriminator": [
        83,
        134,
        200,
        56,
        144,
        56,
        10,
        62
      ]
    },
    {
      "name": "withdrawl",
      "discriminator": [
        39,
        119,
        9,
        87,
        192,
        193,
        129,
        150
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
      "name": "usernameAlreadyTaken",
      "msg": "usernameAlreadyTaken"
    },
    {
      "code": 6004,
      "name": "amountOverflow",
      "msg": "Amount overflow occurred"
    },
    {
      "code": 6005,
      "name": "tipCountOverflow",
      "msg": "Tip count overflow occurred"
    },
    {
      "code": 6006,
      "name": "indexOverflow",
      "msg": "Index overflow occurred"
    },
    {
      "code": 6007,
      "name": "totalSupportersOverflow",
      "msg": "Total supporters overflow occurred"
    },
    {
      "code": 6008,
      "name": "pageOverflow",
      "msg": "Page number overflow occurred"
    },
    {
      "code": 6009,
      "name": "supporterIndexFull",
      "msg": "Supporter index is full"
    },
    {
      "code": 6010,
      "name": "invalidAmount",
      "msg": "Amount must be greater than 0"
    },
    {
      "code": 6011,
      "name": "userCountOverflow",
      "msg": "User count overflow occurred"
    },
    {
      "code": 6012,
      "name": "invalidIndexPage",
      "msg": "Invalid index page"
    },
    {
      "code": 6013,
      "name": "tooManyTipLinks",
      "msg": "Too many tip links"
    },
    {
      "code": 6014,
      "name": "invalidIdLength",
      "msg": "Invalid ID length"
    },
    {
      "code": 6015,
      "name": "invalidDescriptionLength",
      "msg": "Invalid description length"
    },
    {
      "code": 6016,
      "name": "tipLinkCountOverflow",
      "msg": "Tip link count overflow"
    },
    {
      "code": 6017,
      "name": "referrerTooLong",
      "msg": "Referrer string too long"
    },
    {
      "code": 6018,
      "name": "memoTooLong",
      "msg": "Memo string too long"
    },
    {
      "code": 6019,
      "name": "insufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6020,
      "name": "tooManyDeposits",
      "msg": "Too many deposits in index"
    },
    {
      "code": 6021,
      "name": "insufficientFundsInJar",
      "msg": "Insufficient funds in jar"
    },
    {
      "code": 6022,
      "name": "tooManyWithdrawls",
      "msg": "Too many withdrawls in index"
    },
    {
      "code": 6023,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6024,
      "name": "insufficientTokenBalance",
      "msg": "Insufficient token balance"
    },
    {
      "code": 6025,
      "name": "invalidTokenMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6026,
      "name": "maxCurrenciesReached",
      "msg": "Max currencies reached"
    },
    {
      "code": 6027,
      "name": "unsupportedCurrency",
      "msg": "Unsupported currency"
    }
  ],
  "types": [
    {
      "name": "deposit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signer",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tipLink",
            "type": "string"
          },
          {
            "name": "currency",
            "type": "string"
          },
          {
            "name": "referrer",
            "type": "string"
          },
          {
            "name": "memo",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "depositIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "pubkey"
          },
          {
            "name": "indexPage",
            "type": "u32"
          },
          {
            "name": "totalItems",
            "type": "u8"
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
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "jar",
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
            "name": "supporterIndexPage",
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
            "name": "totalSupporters",
            "type": "u32"
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
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "index",
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
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "platform",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "userCount",
            "type": "u64"
          },
          {
            "name": "jarCount",
            "type": "u64"
          },
          {
            "name": "tipLinkCount",
            "type": "u64"
          },
          {
            "name": "depositCount",
            "type": "u64"
          },
          {
            "name": "withdrawlCount",
            "type": "u64"
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
      "name": "supporter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signer",
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
            "name": "tipCount",
            "type": "u16"
          },
          {
            "name": "tips",
            "type": {
              "vec": {
                "defined": {
                  "name": "tipInfo"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "supporterIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "pubkey"
          },
          {
            "name": "indexPage",
            "type": "u32"
          },
          {
            "name": "totalItems",
            "type": "u8"
          },
          {
            "name": "supporters",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "tipInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currency",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
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
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "jar",
            "type": "pubkey"
          },
          {
            "name": "depositCount",
            "type": "u64"
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
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "receiverWallet",
            "type": "pubkey"
          },
          {
            "name": "jar",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
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
      "name": "userByName",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "usernameTaken",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
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
      "name": "withdrawl",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "jar",
            "type": "pubkey"
          },
          {
            "name": "currencyMint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "createdAt",
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
            "name": "index",
            "type": "pubkey"
          },
          {
            "name": "indexPage",
            "type": "u32"
          },
          {
            "name": "totalItems",
            "type": "u8"
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
