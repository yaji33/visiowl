/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/visiowl.json`.
 */
export type Visiowl = {
  "address": "dSwoDETsYGdVtuXCGxNFx9gBCgThB1DRmbH35j4GE1p",
  "metadata": {
    "name": "visiowl",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Visiowl — Solana on-chain reputation layer"
  },
  "instructions": [
    {
      "name": "awardBadge",
      "discriminator": [
        163,
        255,
        101,
        118,
        140,
        5,
        179,
        99
      ],
      "accounts": [
        {
          "name": "repCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  112,
                  45,
                  99,
                  97,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "rep_card.authority",
                "account": "repCard"
              }
            ]
          }
        },
        {
          "name": "scoreAuthority",
          "writable": true,
          "signer": true,
          "address": "dSwoDETsYGdVtuXCGxNFx9gBCgThB1DRmbH35j4GE1p"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "label",
          "type": "string"
        }
      ]
    },
    {
      "name": "createSpace",
      "discriminator": [
        69,
        22,
        245,
        34,
        33,
        119,
        100,
        172
      ],
      "accounts": [
        {
          "name": "spaceAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  112,
                  97,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "operator"
              },
              {
                "kind": "account",
                "path": "nameSeed"
              }
            ]
          }
        },
        {
          "name": "nameSeed"
        },
        {
          "name": "operator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "minScore",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeRepCard",
      "discriminator": [
        147,
        185,
        97,
        219,
        18,
        165,
        40,
        166
      ],
      "accounts": [
        {
          "name": "repCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  112,
                  45,
                  99,
                  97,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "setVisibility",
      "discriminator": [
        182,
        23,
        73,
        166,
        255,
        234,
        36,
        196
      ],
      "accounts": [
        {
          "name": "repCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  112,
                  45,
                  99,
                  97,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "repCard"
          ]
        }
      ],
      "args": [
        {
          "name": "isPublic",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateScore",
      "discriminator": [
        188,
        226,
        238,
        41,
        14,
        241,
        105,
        215
      ],
      "accounts": [
        {
          "name": "repCard",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  112,
                  45,
                  99,
                  97,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "rep_card.authority",
                "account": "repCard"
              }
            ]
          }
        },
        {
          "name": "scoreAuthority",
          "signer": true,
          "address": "dSwoDETsYGdVtuXCGxNFx9gBCgThB1DRmbH35j4GE1p"
        }
      ],
      "args": [
        {
          "name": "newScore",
          "type": "u16"
        }
      ]
    },
    {
      "name": "verifyAccess",
      "discriminator": [
        198,
        35,
        119,
        166,
        140,
        214,
        241,
        222
      ],
      "accounts": [
        {
          "name": "repCard",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  112,
                  45,
                  99,
                  97,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "repCard"
          ]
        },
        {
          "name": "space",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "repCard",
      "discriminator": [
        199,
        70,
        11,
        34,
        255,
        118,
        105,
        75
      ]
    },
    {
      "name": "space",
      "discriminator": [
        120,
        45,
        163,
        4,
        216,
        104,
        38,
        215
      ]
    }
  ],
  "events": [
    {
      "name": "accessVerified",
      "discriminator": [
        39,
        189,
        54,
        21,
        173,
        37,
        247,
        202
      ]
    },
    {
      "name": "badgeAwarded",
      "discriminator": [
        153,
        87,
        158,
        115,
        220,
        200,
        52,
        1
      ]
    },
    {
      "name": "repCardInitialized",
      "discriminator": [
        85,
        195,
        150,
        1,
        165,
        54,
        225,
        19
      ]
    },
    {
      "name": "scoreUpdated",
      "discriminator": [
        175,
        144,
        206,
        62,
        108,
        213,
        230,
        183
      ]
    },
    {
      "name": "spaceCreated",
      "discriminator": [
        237,
        192,
        36,
        66,
        204,
        208,
        90,
        47
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "scoreOutOfRange",
      "msg": "Rep Score must be between 0 and 1000"
    },
    {
      "code": 6001,
      "name": "badgeLabelTooLong",
      "msg": "Badge label exceeds 32 characters"
    },
    {
      "code": 6002,
      "name": "tooManyBadges",
      "msg": "Wallet has reached the maximum badge limit (16)"
    },
    {
      "code": 6003,
      "name": "duplicateBadge",
      "msg": "This badge has already been awarded to this wallet"
    },
    {
      "code": 6004,
      "name": "spaceNameTooLong",
      "msg": "Space name exceeds 64 characters"
    },
    {
      "code": 6005,
      "name": "spaceDescTooLong",
      "msg": "Space description exceeds 256 characters"
    },
    {
      "code": 6006,
      "name": "insufficientScore",
      "msg": "Wallet Rep Score does not meet the Space's minimum requirement"
    },
    {
      "code": 6007,
      "name": "spaceFull",
      "msg": "Space has reached the maximum member limit (1000)"
    },
    {
      "code": 6008,
      "name": "alreadyMember",
      "msg": "This wallet is already a verified member of this Space"
    }
  ],
  "types": [
    {
      "name": "accessVerified",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "space",
            "type": "pubkey"
          },
          {
            "name": "score",
            "type": "u16"
          },
          {
            "name": "required",
            "type": "u16"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "badge",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "label",
            "type": "string"
          },
          {
            "name": "awardedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "badgeAwarded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "label",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "repCard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "score",
            "type": "u16"
          },
          {
            "name": "tier",
            "type": {
              "defined": {
                "name": "tier"
              }
            }
          },
          {
            "name": "badges",
            "type": {
              "vec": {
                "defined": {
                  "name": "badge"
                }
              }
            }
          },
          {
            "name": "lastUpdated",
            "type": "i64"
          },
          {
            "name": "isPublic",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "repCardInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "scoreUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "oldScore",
            "type": "u16"
          },
          {
            "name": "newScore",
            "type": "u16"
          },
          {
            "name": "tier",
            "type": {
              "defined": {
                "name": "tier"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "space",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "minScore",
            "type": "u16"
          },
          {
            "name": "memberCount",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "members",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "spaceCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "minScore",
            "type": "u16"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tier",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "earlyWallet"
          },
          {
            "name": "activeMember"
          },
          {
            "name": "established"
          },
          {
            "name": "powerUser"
          },
          {
            "name": "og"
          }
        ]
      }
    }
  ]
};
