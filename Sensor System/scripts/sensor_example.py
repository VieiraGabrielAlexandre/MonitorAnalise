#!..\..\redist\Python34
# -*- coding: utf-8 -*-

from paepy.ChannelDefinition import CustomSensorResult
import sys
import json

if __name__ == "__main__":
    data = json.loads(sys.argv[1])

    result = CustomSensorResult("this sensor is added to " + data['host'])

    result.add_channel(channel_name="percentage", unit="Percent", value=87, is_float=False, primary_channel=True,
                       is_limit_mode=True, limit_min_error=10, limit_max_error=90,
                       limit_error_msg="percentage too high")
    result.add_channel(channel_name="response time", unit="TimeResponse", value="4711")
    print(result.get_json_result())
