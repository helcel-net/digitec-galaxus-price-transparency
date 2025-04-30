const defv = {
    'percentile': 10,
    'minimum': 7,
}

const format_input = (id) => id == 'percentile' ? '%' : ''

document.querySelectorAll('input').forEach((input) => {
    browser.storage.local.get(input.id).then((res) => {
        input.value = (parseInt(res[input.id]) || defv[input.id]) + format_input(input.id);
    })
    input.addEventListener('input', () => {
        let v = parseInt(input.value.replace(/[^\d.]/g, ''))
        if (input.id == 'percentile') {
            if (v > 100) v = 100;
            if (v < 0) v = 0;
            if (isNaN(v)) v = 10;
            input.value = v + format_input(input.id)
        }
        browser.storage.local.set({ [input.id]: v || 0 }).then((r) => console.log(`${r} saved: ${0}`))
    });
});
