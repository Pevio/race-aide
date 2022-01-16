import { CSSProperties } from "react";

export function About() {
  const pTagStyles: CSSProperties = {
    marginTop: 8,
  };
  return (
    <>
      <h1>About Race Aide</h1>
      <p style={pTagStyles}>
        At Race Aide, you don't have to worry about tracking your race. With
        easy solutions to keep track of your runners and their distances. Here
        are some of our features:
      </p>
      <p style={pTagStyles}>
        <b>Runner and Checkpoint Tracking:</b> With Race Aide, you can easily
        enter in who your runners are and the checkpoints they will be running
        at. Your assistants will record the runners' bib numbers as they pass
        the checkpoints.
      </p>
      <p style={pTagStyles}>
        <b>Results:</b> Race Aide will show you the results of your race, with
        distances broken down by checkpoints, with no extra work for race
        directors.
      </p>
      <p style={pTagStyles}>
        <b>Ease of use:</b> Your assistants at checkpoints and aid stations
        don't need to know the map of the race or who the runners are; they must
        only need to see the bib number of runners to log times. Friends
        following along will see where favorite runners are at.
      </p>
      <p style={pTagStyles}>
        <b>Metrics:</b> Wondering which leg of the race was the most difficult?
        Want to know if the winner made a massive comback? Race Aide will give
        you all the statistics you need for your race. If you want more, you can
        copy the raw data to do what you like with it.
      </p>
      <p style={pTagStyles}>
        <b>Safety:</b> If a runner gets lost, Race Aide will tell you the last
        checkpoint they were at, greatly assiting in potential searches by
        reducing the land area where the runner might be. You will also not have
        to do a head count at the end of the race, since your results page will
        already be populated with checkpoint data.
      </p>
      <p style={pTagStyles}>
        <b>Accountability:</b> If a runner skips a checkpoint, you will know
        before they even "finish" the race.
      </p>
      <p style={pTagStyles}>For more information, contact Peter Gossell.</p>
    </>
  );
}
