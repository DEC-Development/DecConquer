export default {
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "item",
          "name": "dec:smoke_bomb",
          "functions": [
            {
              "function": "set_count",
              "count": {
                "min": 2,
                "max": 3
              }
            }
          ]
        },
        {
          "type": "item",
          "name": "dec:gas_bomb",
          "functions": [
            {
              "function": "set_count",
              "count": {
                "min": 1,
                "max": 2
              }
            }
          ]
        }
      ]
    }
  ]
}