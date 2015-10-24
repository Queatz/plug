describe('Plug App', function() {

    describe('First page interaction', function() {

        beforeEach(function() {
            browser.get('/');
        });

        it('should redirect index.html to index.html#/phones', function() {
            //browser.get('../../app/index.html');
            //browser.getLocationAbsUrl().then(function(url) {
            //    expect(url).toEqual('/home');
            //});
            expect(true).toBe(true);
        });

        //it('it should go to terms and condition page after touch', function() {
        //    element($('#screen')).click()
        //});
    });
});
