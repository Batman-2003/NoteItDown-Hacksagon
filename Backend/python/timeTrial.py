from datetime import datetime
# TODO: datetime -> Str strftime(%Y-%m-%d %H-%M-%S) and str -> datatime strptime(timeString: str)

TIME_FORMAT = "%Y-%m-%d %H-%M-%S"

timeStr1 = "2003-01-09 06-03-59"
timeStr2 = "2002-02-02 09-09-20"

time1 = datetime.strptime(timeStr1, TIME_FORMAT)
time2 = datetime.strptime(timeStr2, TIME_FORMAT)

result = time1 > time2
print(f"{time1} > {time2} = {time1 > time2}")
print(f"{time1} < {time2} = {time1 < time2}")
print(f"{time1} == {time2} = {time1 == time2}")
print(f"min({time1}, {time2}) = {min(time1, time2)}")




# TODO: Itentify which timestamp is newer