
##XYZ
rewr

- 1
- 2

[Common Architecture](/quickstart.md)

fdf

```js 
import Hokku from 'hokku-core';

const {act} = Hokku();
const inc = act();

const {hook} = new Hokku({
    ready() {
        inc().fire();
    }
});

hook(inc, _ => {
    // ???
});
```
